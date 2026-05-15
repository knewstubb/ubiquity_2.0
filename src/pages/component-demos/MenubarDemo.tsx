import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from '@/components/ui/menubar'

interface MenubarDemoProps {
  'menu-count'?: number
  'show-shortcuts'?: boolean
}

export default function MenubarDemo(props: MenubarDemoProps) {
  const menuCount = props['menu-count']
  const showShortcuts = props['show-shortcuts']

  const hasControls = menuCount !== undefined

  if (hasControls) {
    const menus = [
      { label: 'File', items: ['New Campaign', 'Open', 'Save', 'Export'] },
      { label: 'Edit', items: ['Undo', 'Redo', 'Cut', 'Copy', 'Paste'] },
      { label: 'View', items: ['Grid View', 'List View', 'Toggle Sidebar'] },
      { label: 'Help', items: ['Documentation', 'Support', 'About'] },
      { label: 'Tools', items: ['Preferences', 'Extensions', 'Developer'] },
    ]
    const shortcuts = ['⌘N', '⌘O', '⌘S', '⌘E', '⌘Z', '⇧⌘Z', '⌘X', '⌘C', '⌘V']

    return (
      <Menubar>
        {menus.slice(0, menuCount).map((menu, menuIdx) => (
          <MenubarMenu key={menu.label}>
            <MenubarTrigger>{menu.label}</MenubarTrigger>
            <MenubarContent>
              {menu.items.map((item, itemIdx) => (
                <MenubarItem key={item}>
                  {item}
                  {showShortcuts && shortcuts[menuIdx * 2 + itemIdx] && (
                    <MenubarShortcut>{shortcuts[menuIdx * 2 + itemIdx]}</MenubarShortcut>
                  )}
                </MenubarItem>
              ))}
            </MenubarContent>
          </MenubarMenu>
        ))}
      </Menubar>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New Campaign <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Open <MenubarShortcut>⌘O</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Export As</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>CSV</MenubarItem>
                <MenubarItem>PDF</MenubarItem>
                <MenubarItem>Excel</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem>
              Save <MenubarShortcut>⌘S</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Undo <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>
              Cut <MenubarShortcut>⌘X</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Copy <MenubarShortcut>⌘C</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Paste <MenubarShortcut>⌘V</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Grid View</MenubarItem>
            <MenubarItem>List View</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Toggle Sidebar</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  )
}
