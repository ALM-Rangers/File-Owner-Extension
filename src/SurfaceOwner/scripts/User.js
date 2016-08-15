//---------------------------------------------------------------------
// <copyright file="User.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>This class gets represents a user in TFS
// </summary>
//---------------------------------------------------------------------
var User = (function () {
    function User(description, value, text, image) {
        this.description = description;
        this.value = value;
        this.text = text;
        this.image = image;
    }
    return User;
})();
//# sourceMappingURL=User.js.map