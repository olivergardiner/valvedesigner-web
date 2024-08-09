function buildMenu() {
	var menu = document.getElementById("menu");
	var menuItems = [
		{ name: "Triode Common Cathode", link: "triodecc.html" },
		{ name: "Pentode Common Cathode", link: "pentodecc.html" },
		{ name: "AC Cathode Follower", link: "accathodefollower.html" },
		{ name: "DC Cathode Follower", link: "dccathodefollower.html" },
		{ name: "Single Ended Ouput", link: "singleended.html" },
		{ name: "Ultralinear Single Ended Output", link: "singleended-ul.html" },
		{ name: "Push Pull Output", link: "pushpull.html" },
		{ name: "Ultralinear Push Pull Output", link: "pushpull-ul.html" }
	];
	menuItems.forEach(function(item) {
		var menuItem = document.createElement("input");
		menuItem.type = "button";
		menuItem.value = item.name;
		menuItem.onclick = function() {
			window.location.href=item.link;
		}
		menu.appendChild(menuItem);
	});
}