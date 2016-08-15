//---------------------------------------------------------------------
 // <copyright file="IVCManager.ts">
 //    This code is licensed under the MIT License.
 //    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
 //    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
 //    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
 //    PARTICULAR PURPOSE AND NONINFRINGEMENT.
 // </copyright>
 // <summary> This interface defines the VCManager object used to 
 //          calculate all the file ownership information
 // </summary>
 //---------------------------------------------------------------------
interface IVCManager {
    calculateOwners(path: string, parentFolder: string): IPromise<ProcessFileValues>;
    calculateFileLength(path: string): IPromise<string>;
}