> **NOTICE** - We are deprecating this experimental extension!
> ------------------------------------------------------------
> Users who have installed the extension on VSTS or TFS can continue using their version. New installs or downloads are unsupported.
> The extension will continue to serve as an open source solution and sample extension on [GitHub](https://www.github.com/alm-rangers).
> Questions? Please see feedback section below.  

## File Owner ##

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

![Preview](/images/Preview.jpg)

## Quick steps to get started ##
1. Browse to the Web portal and select the Code hub.  Then select the Code Explorer

    ![Browse To Code Explorer](/images/Step1.jpg)

2. Using the tree on the right hand side, browse to the folder you want and then right click the file in the main pane and
select File owner

	![Right Click File](/images/Step2.jpg)

3. This will bring up the File Owners dialog box. Select the file owner from the current owner drop down and click the Close button

	![File Owners Dialog](/images/Step3.jpg)

## Learn more

The [source](https://github.com/ALM-Rangers/File-Owner-Extension) to this extension is available. Feel free to take, fork, and extend.

[View Notices](https://marketplace.visualstudio.com/_apis/public/gallery/publisher/ms-devlabs/extension/FileOwner/latest/assetbyname/ThirdPartyNotices.txt) for third party software included in this extension.
> Microsoft DevLabs is an outlet for experiments from Microsoft, experiments that represent some of the latest ideas around developer tools. Solutions in this category are designed for broad usage, and you are encouraged to use and provide feedback on them; however, these extensions are not supported nor are any commitments made as to their longevity.

## Contributors ##

We thank the following contributors for this extension: Abel Wang, Wouter de Kort and Mikael Krief.

## Feedback

We need your feedback! Here are some ways to connect with us:

- Add a review below.
- Send us an [email](mailto://mktdevlabs@microsoft.com).

Review the [list of features and resolved issues of latest tools and extensions](https://aka.ms/vsarreleases) for information on the latest releases.