export class Message {
    constructor(id, avatar, name, timestamp, message) {
        this.id = id;
        this.avatar = avatar;
        this.name = name;
        this.timestamp = timestamp;
        this.message = message;
    }

    prepareMessage(templateID) {
        let template = document.getElementById(templateID).innerHTML;
        for (const [key, value] of Object.entries(this)) {
            const replace = "{{" + key + "}}";
            template = template.replace(replace, value);
        }
        return template;
    }

    // Could expose the first argument of the insertAdjacentHTML method for more control
    displayBefore(insertPoint, templateID) {
        let preparedMessage = this.prepareMessage(templateID);
        if (!document.getElementById('message' + this.id)) // Check that the message has not been displayed already
            insertPoint.insertAdjacentHTML('beforebegin', preparedMessage);
    }

}
