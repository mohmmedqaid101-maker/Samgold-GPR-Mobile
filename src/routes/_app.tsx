import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Radar,
  Activity,
  Brain,
  Map as MapIcon,
  FileText,
  UserCircle2,
  LogOut,
  Loader2,
  Upload,
  Crosshair,
  Layers,
  Video,
  Settings as SettingsIcon,
  ShieldCheck,
  Users,
  Cpu,
  ChevronDown,
  CreditCard,
  HardDrive,
  Database,
  Bell,
  History,
  Zap,
  Lock,
  FolderKanban,
  Info,
  ShieldQuestion,
  LifeBuoy,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { LangToggle } from "@/components/LangToggle";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useRoles } from "@/hooks/useRoles";
import { useNotifications } from "@/hooks/useNotifications";

function NotifBadge() {
  const { unreadCount } = useNotifications();
  if (unreadCount <= 0) return null;
  return (
    <span className="ml-auto inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-background text-[10px] font-bold">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { t, lang, dir } = useI18n();
  const location = useLocation();
  const { isAdmin } = useRoles();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isActive = (path: string) => location.pathname === path;
  const isInside = (path: string) => location.pathname.startsWith(path);

  const scannerOpen = isInside("/scanner");
  const mapOpen = isInside("/map");
  const adminOpen = isInside("/admin");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background" dir={dir}>
        <Sidebar collapsible="icon" side={lang === "ar" ? "right" : "left"}>
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="px-2 py-2">
              <Logo size="sm" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="font-tech tracking-wider text-xs">
                SAMGOLD
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* Dashboard */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                      <Link to="/dashboard">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>{t("nav.dashboard")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Scanner group */}
                  <Collapsible defaultOpen={scannerOpen} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={scannerOpen}>
                          <Radar className="h-4 w-4" />
                          <span>{t("nav.group.scanner")}</span>
                          <ChevronDown className="ms-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={isActive("/scanner/receive")}>
                              <Link to="/scanner/receive">
                                <Upload className="h-3.5 w-3.5" />
                                <span>{t("nav.scanner.receive")}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={isActive("/ai-analysis")}>
                              <Link to="/ai-analysis">
                                <Brain className="h-3.5 w-3.5" />
                                <span>{t("nav.ai")}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={isActive("/scanner/targets")}>
                              <Link to="/scanner/targets">
                                <Crosshair className="h-3.5 w-3.5" />
                                <span>{t("nav.scanner.targets")}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={isActive("/scanner")}>
                              <Link to="/scanner">
                                <Radar className="h-3.5 w-3.5" />
                                <span>{t("nav.scanner")}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>

                  {/* Frequency */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/frequency")}>
                      <Link to="/frequency">
                        <Activity className="h-4 w-4" />
                        <span>{t("nav.frequency")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Maps group */}
                  <Collapsible defaultOpen={mapOpen} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={mapOpen}>
                          <MapIcon className="h-4 w-4" />
                          <span>{t("nav.group.maps")}</span>
                          <ChevronDown className="ms-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={isActive("/map")}>
                              <Link to="/map">
                                <MapIcon className="h-3.5 w-3.5" />
                                <span>{t("nav.map")}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={isActive("/map/layers")}>
                              <Link to="/map/layers">
                                <Layers className="h-3.5 w-3.5" />
                                <span>{t("nav.map.layers")}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={isActive("/map/cinematic")}>
                              <Link to="/map/cinematic">
                                <Video className="h-3.5 w-3.5" />
                                <span>{t("nav.map.cinematic")}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>

                  {/* Reports */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/reports")}>
                      <Link to="/reports">
                        <FileText className="h-4 w-4" />
                        <span>{t("nav.reports")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Platform tiles */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/projects")}>
                      <Link to="/projects">
                        <FolderKanban className="h-4 w-4" />
                        <span>{t("tile.projects")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/data")}>
                      <Link to="/data">
                        <Database className="h-4 w-4" />
                        <span>{t("tile.data")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/devices")}>
                      <Link to="/devices">
                        <HardDrive className="h-4 w-4" />
                        <span>{t("tile.devices")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/subscriptions")}>
                      <Link to="/subscriptions">
                        <CreditCard className="h-4 w-4" />
                        <span>{t("tile.subscriptions")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/notifications")}>
                      <Link to="/notifications">
                        <Bell className="h-4 w-4" />
                        <span>{t("tile.notifications")}</span>
                        <NotifBadge />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/activity")}>
                      <Link to="/activity">
                        <History className="h-4 w-4" />
                        <span>{t("tile.activity")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/performance")}>
                      <Link to="/performance">
                        <Zap className="h-4 w-4" />
                        <span>{t("tile.performance")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/updates")}>
                      <Link to="/updates">
                        <History className="h-4 w-4" />
                        <span>{t("tile.updates")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/security")}>
                      <Link to="/security">
                        <ShieldCheck className="h-4 w-4" />
                        <span>{t("tile.security")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/permissions")}>
                      <Link to="/permissions">
                        <Lock className="h-4 w-4" />
                        <span>{t("tile.permissions")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Settings */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/settings")}>
                      <Link to="/settings">
                        <SettingsIcon className="h-4 w-4" />
                        <span>{t("nav.settings")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/about")}>
                      <Link to="/about">
                        <Info className="h-4 w-4" />
                        <span>{t("nav.about")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/privacy")}>
                      <Link to="/privacy">
                        <ShieldQuestion className="h-4 w-4" />
                        <span>{t("nav.privacy")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/support")}>
                      <Link to="/support">
                        <LifeBuoy className="h-4 w-4" />
                        <span>{t("nav.support")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Admin group — only for admins */}
                  {isAdmin && (
                    <Collapsible defaultOpen={adminOpen} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton isActive={adminOpen}>
                            <ShieldCheck className="h-4 w-4" />
                            <span>{t("nav.admin")}</span>
                            <ChevronDown className="ms-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={isActive("/admin")}>
                                <Link to="/admin">
                                  <LayoutDashboard className="h-3.5 w-3.5" />
                                  <span>{t("nav.admin.dashboard")}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={isActive("/admin/users")}>
                                <Link to="/admin/users">
                                  <Users className="h-3.5 w-3.5" />
                                  <span>{t("nav.admin.users")}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={isActive("/admin/surveys")}>
                                <Link to="/admin/surveys">
                                  <Radar className="h-3.5 w-3.5" />
                                  <span>{t("nav.admin.surveys")}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={isActive("/admin/ai")}>
                                <Link to="/admin/ai">
                                  <Cpu className="h-3.5 w-3.5" />
                                  <span>{t("nav.admin.ai")}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isInside("/account")}>
                  <Link to="/account">
                    <UserCircle2 className="h-4 w-4" />
                    <span>{t("nav.account")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                  <span>{t("nav.signout")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border bg-card/40 backdrop-blur flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground hidden sm:inline truncate">
                {user.email}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LangToggle />
              <Button size="sm" variant="ghost" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
