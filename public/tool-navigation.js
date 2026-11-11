/** Circuit links use the same definition registry as the circuit workspace. */
const toolCircuitMenu = document.getElementById('circuit-menu-links');
for (const link of designerCalculatorLinks.concat([{title: 'All circuits', href: '#circuits'}])) {
	const anchor = document.createElement('a');
	anchor.href = 'designer.html' + link.href;
	anchor.textContent = link.title;
	toolCircuitMenu.append(anchor);
}
const toolMenus = [...document.querySelectorAll('.app-header details')];
for (const menu of toolMenus) {
	menu.addEventListener('toggle', () => { if (menu.open) toolMenus.filter(other => other !== menu).forEach(other => { other.open = false; }); });
	menu.addEventListener('click', event => { if (event.target.closest('a')) menu.open = false; });
}
document.addEventListener('click', event => toolMenus.forEach(menu => { if (!menu.contains(event.target)) menu.open = false; }));
document.addEventListener('keydown', event => {
	if (event.key === 'Escape') toolMenus.filter(menu => menu.open).forEach(menu => { menu.open = false; menu.querySelector('summary').focus(); });
});
if (document.body.dataset.tool === 'characteristics') document.querySelector('nav > a').setAttribute('aria-current', 'page');
else document.querySelector('nav details:last-child summary').setAttribute('aria-current', 'page');
