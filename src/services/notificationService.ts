const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Notification {
  id: number;
  type: 'image' | 'compte_rendu' | 'rendez_vous' | 'user';
  title: string;
  message: string;
  related_id?: number;
  is_read: boolean;
  created_at: string;
  user?: {
    id: number;
    name: string;
    lastName: string;
  };
}

// Récupérer toutes les notifications de l'utilisateur connecté avec pagination
export async function getNotifications(
  token: string,
  limit: number = 20,
  offset: number = 0,
): Promise<{ notifications: Notification[]; total: number }> {
  try {
    const res = await fetch(`${API_URL}/notifications?limit=${limit}&offset=${offset}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "Impossible de récupérer les notifications" }));
      console.error("Erreur API notifications:", res.status, errorData);
      throw new Error(errorData.message || "Impossible de récupérer les notifications");
    }

    const data = await res.json();
    
    // Gérer les deux formats possibles : { notifications, total } ou tableau direct
    if (data && data.notifications && Array.isArray(data.notifications)) {
      return data;
    } else if (Array.isArray(data)) {
      return { notifications: data, total: data.length };
    } else {
      return { notifications: [], total: 0 };
    }
  } catch (error) {
    console.error("Erreur dans getNotifications:", error);
    throw error;
  }
}

// Récupérer les notifications non lues avec pagination
export async function getUnreadNotifications(
  token: string,
  limit: number = 20,
  offset: number = 0,
): Promise<{ notifications: Notification[]; total: number }> {
  const res = await fetch(`${API_URL}/notifications/unread?limit=${limit}&offset=${offset}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Impossible de récupérer les notifications non lues" }));
    throw new Error(errorData.message || "Impossible de récupérer les notifications non lues");
  }

  return res.json();
}

// Compter les notifications non lues
export async function getUnreadCount(token: string): Promise<number> {
  try {
    const res = await fetch(`${API_URL}/notifications/count`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn("Impossible de récupérer le compte de notifications:", res.status);
      return 0;
    }

    const data = await res.json();
    return typeof data.count === 'number' ? data.count : 0;
  } catch (error) {
    console.error("Erreur dans getUnreadCount:", error);
    return 0;
  }
}

// Marquer une notification comme lue
export async function markAsRead(id: number, token: string): Promise<Notification> {
  const res = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Impossible de marquer la notification comme lue" }));
    throw new Error(errorData.message || "Impossible de marquer la notification comme lue");
  }

  return res.json();
}

// Marquer toutes les notifications comme lues
export async function markAllAsRead(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/notifications/read-all`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Impossible de marquer toutes les notifications comme lues" }));
    throw new Error(errorData.message || "Impossible de marquer toutes les notifications comme lues");
  }
}

// Supprimer une notification
export async function deleteNotification(id: number, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/notifications/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Impossible de supprimer la notification" }));
    throw new Error(errorData.message || "Impossible de supprimer la notification");
  }
}
