//---------------------------------------------------------------------
// <copyright file="Owner.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary> This class represents an owner of a file and holds all the
//          owner information for the file
// </summary>
//---------------------------------------------------------------------
var Owner = (function () {
    function Owner(name, id, email, contributions, imageUrl) {
        this.name = name;
        this.id = id;
        this.email = email;
        this.contributions = contributions;
        this.imageUrl = imageUrl;
    }
    return Owner;
})();
//# sourceMappingURL=Owner.js.map