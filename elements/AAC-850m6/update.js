function(instance, properties, context) {
    
    instance.data.input_box_id = properties.input_box_id;
    instance.data.submit_button_id = properties.submit_button_id;

    instance.data.openai_api_key = properties.openai_api_key;
    instance.data.url = properties.url;

    
    instance.data.updateOpenAIResponse = function(response) {
        instance.publishState('openai_chat_response', response);
    };
}
