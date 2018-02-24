# File Owner Extension

![](https://almrangers.visualstudio.com/DefaultCollection/_apis/public/build/definitions/7f3cfb9a-d1cb-4e66-9d36-1af87b906fe9/102/badge)

> **NOTICE** - We have deprecated this extension from the [Visual Studio Marketplace](https://marketplace.visualstudio.com). The extension will continue to serve as an open source solution and sample extension on GitHub.

This extension allows users to quickly and easily determine ownership of a file.  Given a file, this extension returns the following:

- Name of file
- Size of file
- File created by
- Initial checkin comments
- Commit Id/Changeset Id
- Current owner of the file
- Suggested owners
    * Person who made the most contributions to the file
	* Person who recently reviewed the file
	* Person who made the most contributions to the files in the same folder
	
This extension works with both Git and TFVC repositories.

![Preview](/src/SurfaceOwner/images/Preview.jpg)

## Quick steps to get started
1. Browse to the Web portal and select the Code hub.  Then select the Code Explorer

    ![Browse To Code Explorer](/src/SurfaceOwner/images/Step1.jpg)

2. Using the tree on the right hand side, browse to the folder you want and then right click the file in the main pane and
select File owner

	![Right Click File](/src/SurfaceOwner/images/Step2.jpg)

3. This will bring up the File Owners dialog box. Select the file owner from the current owner drop down and click the Close button

	![File Owners Dialog](/src/SurfaceOwner/images/Step3.jpg)

## Contributors

We thank the following contributors for this extension: Abel Wang, Wouter de Kort and Mikael Krief.

## Notices
Notices for certain third party software included in this solution are provided here: [Third Party Notice](ThirdPartyNotices.txt).

## Contribute
Contributions to File Owner are welcome. Here is how you can contribute:  

- Submit bugs and help us verify fixes  
- Submit pull requests for bug fixes and features and discuss existing proposals   

Please refer to [Contribution guidelines](.github/CONTRIBUTING.md) and the [Code of Conduct](.github/COC.md) for more details.
