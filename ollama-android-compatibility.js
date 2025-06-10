// Ollama Android Compatibility Layer
class OllamaAndroidCompatibility {
    constructor() {
        this.isAndroid = window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'android';
        this.detectedUrl = null;        this.commonUrls = [
            'http://localhost:11434',
            'http://127.0.0.1:11434',
            'http://10.0.2.2:11434',    // Android emulator localhost
            'http://192.168.1.1:11434', // Common router IP
            'http://192.168.0.1:11434', // Another common router IP
            'http://192.168.1.100:11434', // Common device IP
            'http://192.168.0.100:11434', // Common device IP
            'http://10.0.0.1:11434',    // Common router IP
            'http://172.16.0.1:11434'   // Private network range
        ];
        this.timeout = 8000; // 8 second timeout
    }

    async detectOllamaUrl() {
        if (this.detectedUrl) {
            console.log('[Ollama] Using cached URL:', this.detectedUrl);
            return this.detectedUrl;
        }

        console.log('[Ollama] Auto-detecting Ollama server...');
        
        for (const url of this.commonUrls) {
            try {
                console.log('[Ollama] Testing:', url);
                const testUrl = `${url}/api/tags`;
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(testUrl, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    this.detectedUrl = url;
                    console.log('[Ollama] ✓ Found Ollama server at:', url);
                    
                    if (window.tip) {
                        window.tip(`Ollama server detected at ${url}`, false, 'success', 3000);
                    }
                    
                    return url;
                }
            } catch (error) {
                console.log('[Ollama] ✗ Failed to connect to:', url, error.message);
                continue;
            }
        }
        
        // If we get here, no URL worked
        console.warn('[Ollama] Could not detect Ollama server on any common URLs');
        
        if (window.tip) {
            window.tip('Could not detect Ollama server. Make sure Ollama is running locally on port 11434.', false, 'warning', 5000);
        }
        
        // Return default localhost as fallback
        return 'http://localhost:11434';
    }

    async generateWithOllama({key, model, prompt, temperature, onContent}) {
        const ollamaModelName = key; // Model name is passed as 'key'
        
        // Get the correct URL
        const baseUrl = await this.detectOllamaUrl();
        const generateUrl = `${baseUrl}/api/generate`;
        
        console.log('[Ollama] Generating with model:', ollamaModelName, 'at:', generateUrl);

        const headers = {
            "Content-Type": "application/json"
        };

        const body = {
            model: ollamaModelName,
            prompt: prompt,
            system: "I'm working on my fantasy map.",
            options: {
                temperature: temperature
            },
            stream: true
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for generation
            
            const response = await fetch(generateUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorMessage = `Ollama request failed (${response.status} ${response.statusText})`;
                try {
                    const json = await response.json();
                    if (json?.error) {
                        errorMessage = `Ollama error: ${json.error}`;
                    }
                } catch (e) {
                    console.error('[Ollama] Failed to parse error response:', e);
                }
                throw new Error(errorMessage);
            }

            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            while (true) {
                const {done, value} = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, {stream: true});
                const lines = buffer.split("\n");

                for (let i = 0; i < lines.length - 1; i++) {
                    const line = lines[i].trim();
                    if (line) {
                        try {
                            const json = JSON.parse(line);
                            if (json.response) {
                                onContent(json.response);
                            }
                            if (json.done) {
                                console.log('[Ollama] Generation completed');
                                return;
                            }
                        } catch (jsonError) {
                            console.error('[Ollama] Failed to parse JSON:', jsonError, 'Line:', line);
                        }
                    }
                }

                buffer = lines.at(-1);
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Ollama request timed out. Make sure Ollama is running and accessible.');
            } else if (error.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to Ollama. Make sure Ollama is running locally on port 11434.');
            } else {
                throw error;
            }
        }
    }

    async testConnection() {
        try {
            const url = await this.detectOllamaUrl();
            return { success: true, url };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
window.ollamaAndroid = new OllamaAndroidCompatibility();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OllamaAndroidCompatibility;
}
