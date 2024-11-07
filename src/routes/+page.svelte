<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { fade } from 'svelte/transition';
    
    interface Alert {
        message: string;
        type: 'success' | 'error' | 'warning';
    }

    interface WebSocketMessage {
        type: 'init' | 'update';
        content: string;
    }

    let text = "";
    let lineNumbers = "1";
    let ws: WebSocket | null = null;
    let alert: Alert | null = null;

    function showAlert(message: string, type: Alert['type'] = 'warning'): void {
        alert = { message, type };
        setTimeout(() => {
            alert = null;
        }, 3000);
    }

    function updateLineNumbers(): void {
        const lines = text.split('\n').length;
        lineNumbers = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
    }

    function handleTextChange(): void {
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'update',
                content: text
            }));
        }
        updateLineNumbers();
    }

    function connectWebSocket(): void {
        ws = new WebSocket('ws://localhost:8080');
        
        ws.onopen = () => {
            showAlert('Connected to server', 'success');
        };

        ws.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data) as WebSocketMessage;
                if (data.type === 'init' || data.type === 'update') {
                    text = data.content;
                    updateLineNumbers();
                }
            } catch (err) {
                showAlert('Error processing message', 'error');
            }
        };

        ws.onclose = () => {
            showAlert('Connection lost. Reconnecting...', 'warning');
            setTimeout(connectWebSocket, 1000);
        };

        ws.onerror = () => {
            showAlert('WebSocket error occurred', 'error');
        };
    }

    onMount(() => {
        connectWebSocket();
    });

    onDestroy(() => {
        if (ws) ws.close();
    });
</script>

{#if alert}
    <div 
        transition:fade
        class="fixed top-4 right-4 z-50 min-w-[200px] p-4 rounded-lg shadow-lg {
            alert.type === 'success' ? 'bg-green-100 text-green-800 border-green-300' :
            alert.type === 'error' ? 'bg-red-100 text-red-800 border-red-300' :
            'bg-yellow-100 text-yellow-800 border-yellow-300'
        }"
        role="alert"
    >
        <div class="flex items-center gap-2">
            {#if alert.type === 'success'}
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
            {:else if alert.type === 'error'}
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                </svg>
            {:else}
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                </svg>
            {/if}
            <span>{alert.message}</span>
        </div>
    </div>
{/if}

<div class="flex h-screen border border-gray-300">
    <pre id="lineNumbers" class="w-10 px-2 py-[3px] bg-gray-100 text-gray-500 text-right font-mono text-sm leading-[1.5] whitespace-pre select-none overflow-hidden">{lineNumbers}</pre>
    <textarea
        bind:value={text}
        on:input={handleTextChange}
        class="flex-grow p-[3px] m-0 border-none outline-none resize-none font-mono text-sm leading-[1.5] overflow-y-auto"
        placeholder="Start typing..."
    ></textarea>
</div>