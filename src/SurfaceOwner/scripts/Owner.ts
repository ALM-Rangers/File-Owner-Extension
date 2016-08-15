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
class Owner {
    constructor(public name: string, public id: string, public email: string, public contributions: number, public imageUrl: string) {
    }
}
