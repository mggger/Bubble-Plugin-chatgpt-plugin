function(instance, context) {
    instance.data.openai_api_key = instance.data.openai_api_key || '';
    instance.data.url = instance.data.url;
    instance.data.input_box_id = instance.data.input_box_id || '';
    instance.data.submit_button_id = instance.data.submit_button_id || '';

    instance.data.processChunkedResponse = function(reader, decoder, accumulatedText = '') {
        reader.read().then(({ done, value }) => {
            if (done) {
                console.log('Stream completed');
                instance.data.updateOpenAIResponse(accumulatedText);
                instance.triggerEvent("openai_response_done");
                return;
            }
            var textChunk = decoder.decode(value, {stream: true});
            var contentRegex = /"content":"(.*?)"/g;
            var match;
            while ((match = contentRegex.exec(textChunk)) !== null) {
                accumulatedText += match[1];
            }

            console.log(accumulatedText);

            instance.publishState("openai_chat_response", accumulatedText);

            instance.data.processChunkedResponse(reader, decoder, accumulatedText);
        }).catch(e => {
            console.error('Error while reading the stream', e);
        });
    };

    instance.data.callOpenAI = function(promptText) {
        const apiKey = instance.data.openai_api_key;
        const url = instance.data.url;


        const messages = [];

        messages.push({
            role: "user",
            content: promptText
        });

        console.log(messages);

        const data = JSON.stringify([{
            "provider": "openai",
            "endpoint": "chat/completions",
            "headers": {
                "authorization": "Bearer " + apiKey,
                "content-type": "application/json"
            },
            "query": {
                "model": "gpt-3.5-turbo",
                "messages": messages,
                "stream": true
            }
        }]);

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer ' + apiKey
            },
            body: data
        }).then(response => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            instance.data.processChunkedResponse(reader, decoder);
        }).catch(error => {
            console.error('Error calling OpenAI API:', error);
        });
    };

    instance.data.bindSubmitButton = function() {
        instance.publishState('openai_chat_response', '');
        $('#' + instance.data.submit_button_id).on('click', function() {
            const promptText = $('#' + instance.data.input_box_id).val();
            instance.data.callOpenAI(promptText);
        });
    };

    $(document).ready(function() {
        instance.data.bindSubmitButton();
    });
}
