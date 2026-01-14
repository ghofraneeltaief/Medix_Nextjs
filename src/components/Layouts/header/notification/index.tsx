"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { BellIcon } from "./icons";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type Notification,
} from "@/services/notificationService";

// Fonction pour obtenir l'icône selon le type de notification
function getNotificationIcon(type: string): string {
  switch (type) {
    case "image":
      return "🖼️";
    case "compte_rendu":
      return "📄";
    case "rendez_vous":
      return "📅";
    case "user":
      return "👤";
    default:
      return "🔔";
  }
}

// Fonction pour obtenir le lien selon le type et le rôle
function getNotificationLink(type: string, relatedId?: number): string {
  const role = localStorage.getItem("role") || "technicien";
  
  switch (type) {
    case "image":
      switch (role) {
        case "admin":
          return "/admin/image";
        case "médecin":
          return "/medecin-externe/image";
        case "médecin radiologue":
          return "/radiologue/image";
        case "technicien":
          return "/technicien/image";
        default:
          return "/admin/image";
      }
    case "compte_rendu":
      switch (role) {
        case "admin":
          return "/admin/compterendu";
        case "médecin":
          return "/medecin-externe/compterendu";
        case "médecin radiologue":
          return "/radiologue/compterendu";
        default:
          return "/admin/compterendu";
      }
    case "rendez_vous":
      switch (role) {
        case "admin":
          return "/admin/calendar";
        case "assistante":
          return "/assistante/calendar";
        default:
          return "/admin/calendar";
      }
    case "user":
      return "/admin/users";
    default:
      return "#";
  }
}

const NOTIFICATION_REFRESH_INTERVAL = 30000; // 30 secondes
const NOTIFICATION_LIMIT = 20;

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  const loadNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const [notifsData, count] = await Promise.all([
        getNotifications(token, NOTIFICATION_LIMIT, 0),
        getUnreadCount(token),
      ]);

      // Vérifier que la structure est correcte
      if (notifsData && notifsData.notifications) {
        setNotifications(notifsData.notifications);
      } else if (Array.isArray(notifsData)) {
        // Fallback si l'API retourne directement un tableau
        setNotifications(notifsData);
      } else {
        setNotifications([]);
      }
      
      setUnreadCount(count || 0);
    } catch (error: any) {
      console.error("Erreur lors du chargement des notifications:", error);
      // En cas d'erreur, réinitialiser les notifications
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    // Recharger les notifications toutes les 30 secondes
    const interval = setInterval(loadNotifications, NOTIFICATION_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleNotificationClick = useCallback(async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          await markAsRead(notification.id, token);
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, is_read: true } : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("Erreur lors du marquage de la notification:", error);
      }
    }
    setIsOpen(false);
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await markAllAsRead(token);
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Erreur lors du marquage de toutes les notifications:", error);
    }
  }, []);

  // Mémoriser les notifications non lues pour éviter les recalculs
  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.is_read),
    [notifications]
  );

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={(open) => {
        setIsOpen(open);
        if (open) {
          loadNotifications();
        }
      }}
    >
      <DropdownTrigger
        className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />

          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute right-0 top-0 z-1 flex size-5 items-center justify-center rounded-full bg-red-light text-xs font-medium text-white ring-2 ring-gray-2 dark:ring-dark-3",
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="border border-stroke bg-white px-3.5 py-3 shadow-md dark:border-dark-3 dark:bg-gray-dark min-[350px]:min-w-[20rem]"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-medium text-dark dark:text-white">
            Notifications
          </span>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:underline"
              >
                Tout marquer comme lu
              </button>
              <span className="rounded-md bg-primary px-[9px] py-0.5 text-xs font-medium text-white">
                {unreadCount} {unreadCount === 1 ? "nouvelle" : "nouvelles"}
              </span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-4 text-center text-sm text-dark-5 dark:text-dark-6">
            Chargement...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-4 text-center text-sm text-dark-5 dark:text-dark-6">
            Aucune notification
          </div>
        ) : (
          <ul className="mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto">
            {notifications.map((notification) => (
              <li key={notification.id} role="menuitem">
                <Link
                  href={getNotificationLink(notification.type, notification.related_id)}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex items-center gap-4 rounded-lg px-2 py-1.5 outline-none transition-colors",
                    notification.is_read
                      ? "hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3"
                      : "bg-blue-light-5 hover:bg-blue-light-5 focus-visible:bg-blue-light-5 dark:bg-dark-3 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3",
                  )}
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-gray-2 text-lg dark:bg-dark-3">
                    {getNotificationIcon(notification.type)}
                  </span>

                  <div className="flex-1">
                    <strong className="block text-sm font-medium text-dark dark:text-white">
                      {notification.title}
                    </strong>

                    <span className="truncate text-sm font-medium text-dark-5 dark:text-dark-6">
                      {notification.message}
                    </span>

                    <span className="mt-1 block text-xs text-dark-5 dark:text-dark-6">
                      {new Date(notification.created_at).toLocaleString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {!notification.is_read && (
                    <span className="size-2 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {notifications.length > 0 && (
          <Link
            href="#"
            onClick={() => setIsOpen(false)}
            className="block rounded-lg border border-primary p-2 text-center text-sm font-medium tracking-wide text-primary outline-none transition-colors hover:bg-blue-light-5 focus:bg-blue-light-5 focus:text-primary focus-visible:border-primary dark:border-dark-3 dark:text-dark-6 dark:hover:border-dark-5 dark:hover:bg-dark-3 dark:hover:text-dark-7 dark:focus-visible:border-dark-5 dark:focus-visible:bg-dark-3 dark:focus-visible:text-dark-7"
          >
            Voir toutes les notifications
          </Link>
        )}
      </DropdownContent>
    </Dropdown>
  );
}
