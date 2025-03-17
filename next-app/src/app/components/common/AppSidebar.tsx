'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { ContentsMenu, OperateMenu } from '@/constants/Menu'
import useLink from '@/hooks/useLink'
import useMenuStore from '@/stores/store.menu'

export function AppSidebar() {
  const { onLink } = useLink()
  const { menu } = useMenuStore()

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Contents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ContentsMenu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button onClick={item.url === '#' ? () => {} : () => onLink(item.url)}>
                      <item.icon />
                      <span className={menu === item.url ? 'font-black text-blue-600' : ''}>
                        {item.title}
                      </span>
                    </button>
                  </SidebarMenuButton>
                  {item.subMenu && (
                    <SidebarMenuSub>
                      {item.subMenu.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton>
                            <button onClick={() => onLink(item.url)}>
                              <span className={menu === item.url ? 'font-black text-blue-600' : ''}>
                                {item.title}
                              </span>
                            </button>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>운영</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {OperateMenu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button onClick={item.url === '#' ? () => {} : () => onLink(item.url)}>
                      <item.icon />
                      <span className={menu === item.url ? 'font-black text-blue-600' : ''}>
                        {item.title}
                      </span>
                    </button>
                  </SidebarMenuButton>
                  {item.subMenu && (
                    <SidebarMenuSub>
                      {item.subMenu.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton>
                            <button onClick={() => onLink(item.url)}>
                              <span className={menu === item.url ? 'font-black text-blue-600' : ''}>
                                {item.title}
                              </span>
                            </button>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>통계</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu></SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Statistics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu></SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
