var projectManager = function() {
    // Create context menu
    var createContextMenu = new ContextMenu();
    var manageContextMenu = new ContextMenu();
    var createProjectUserList = [];
    
	this.init = function() {
        // Get the project list
        // TODO: Store the projects
		var msg = new Message();
		msg.fromVal("project:get-projects", undefined);
		modules.socket.sendMessage(msg);
        
        // Add context menu items
        createContextMenu.addItem("New file", function(){$("#file-content").append($("#file-content").html())});
        createContextMenu.addItem("New project", function(){modules.projectManager.addProject();});
        
        // TODO: Check on how to get the item ID
        manageContextMenu.addItem("Rename", function(){});
        manageContextMenu.addItem("Move", function(){});
        manageContextMenu.addItem("Delete", function(){});
        
        // Display all context menu
        $("#file-content").on("contextmenu", function(e){
            e.preventDefault();
            e.stopPropagation();
            createContextMenu.display(mouse.x, mouse.y);
        });
        
        $("#tool-box-new-file").on("click", function(e) {
            // Prevent instant closing
            setTimeout(function(){
                createContextMenu.display(mouse.x, mouse.y);
            }, 1);
        });
	};
	
    
	this.addProject = function() {
		var dialogBox = new DialogBox();
		var msg = new Message();
		msg.fromVal("project:get-all-users", "");
		modules.socket.sendMessage(msg);
		
		dialogBox.display(
			"<div id='create-project-informations'>" +
                "Project informations<hr>" +
				"<input class='smallSize' type='text'/ placeholder='Project name'>" + 
				"<br><br><textarea style='height:170px;width:100%;' placeholder='Project description'></textarea>" + 
			"</div>" + 
			"<div id='create-project-users'>" + 
                "Add members<hr>" + 
				"<input onkeyup='modules.projectManager.refreshCreateProjectUserList()' id='createProjectSearch' style='margin-bottom: 10px; width:96%;' type='text'/ placeholder='Search a user...'>" + 
				"<div id='userList'></div>" + 
			"</div><input type='button' value='Create the project'>"
		, "Create a project");
	};
	
	this.selectUser = function(e) {
        // TODO: Store rights as well
        createProjectUserList[$(e.target).data("userId")].isSelected = !createProjectUserList[$(e.target).data("userId")].isSelected;
            
        if(e.target.className == 'username')
            e.target = e.target.parentNode;
        
        if(e.target.className == 'user' || e.target.className == 'user user-selected')
            $(e.target).toggleClass("user-selected");
    };
    
	this.displayProjects = function(data) {
		if(data.length == 0) {
			$("#file-content").text("There's nothing here.");
		}
		else {
			$("#file-content").html("");
			for(var i = 0; i < data.length; i++) {
				var imageType = data[i].isFolder ? "folder" : "file";
                
                var element = $("<div>");
                element.addClass("file");
                element.html(
					'<span class="file-icon"><img src="resources/ui/images/folder.png" alt="' + imageType + '-image"/></span>' + 
					'<span class="file-title">' + data[i].projectName + '</span>' + 
					'<span class="file-last-modification">Jamais</span>' + 
					'<span class="file-working-people">' + Math.round(Math.random() * 20) + '</span>'
                );
                
                element.on("contextmenu", function(e) {
                    e.preventDefault();
                    manageContextMenu.display(mouse.x, mouse.y);
                });
                
                $("#file-content").append(element);
			}
			$("#file-history").html("");
		}
	};
  
	this.refreshCreateProjectUserList = function() {
        $("#userList").html("");

        for(var i = 0; i < createProjectUserList.length; i++) {
            
            if($("#createProjectSearch").val() != "") {
                if(createProjectUserList[i].username.toLowerCase().indexOf($("#createProjectSearch").val().toLowerCase()) == -1)
                    continue;
            }
            
            var element = $("<div>");
            element.addClass("user");
            
            if(createProjectUserList[i].isSelected)
                element.addClass("user-selected");
                
            element.on("click", function(e){modules.projectManager.selectUser(e)});
            element.data("userId", i);
            element.append(
                    "<span data-user-id='" + i + "' class='username'>" + createProjectUserList[i].username + "</span>" +
                    "<select>" + 
                        "<option>Read only</option>" + 
                        "<option>Write rights</option>" + 
                        "<option>Admin rights</option>" + 
                    "</select>"
            );
                
            $("#userList").append(element);
        }
        
        if($("#userList").text() == "")
           $("#userList").append("No results founds"); 
    };
    
	this.handleMessage = function(message) {
		switch(message.type) {
			case "project-list":
				this.displayProjects(message.data);
				break;
			case "all-users":
                createProjectUserList = message.data;
                this.refreshCreateProjectUserList();
				break;
		}
	};
}