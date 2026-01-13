const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Imagerie {
  id?: number;
  type: string;
  urlImage: string;
  compteRenduId?: number;
  rendezVousId?: number;

  rendezVous?: {
    id?: number;
    nom_patient: string;
    date: string;
    heure: string;
    acte?: {
      Nom_Acte: string;
    };
  };
}




// Récupérer toutes les imageries
export async function getImageries(): Promise<Imagerie[]> {
  const res = await fetch(`${API_URL}/imageries`, { cache: "no-store" });
  if (!res.ok) throw new Error("Impossible de récupérer les imageries");
  return res.json();
}

// Récupérer une imagerie par ID
export async function getImagerieById(id: number): Promise<Imagerie> {
  const res = await fetch(`${API_URL}/imageries/${id}`);
  if (!res.ok) throw new Error("Imagerie introuvable");
  return res.json();
}

// Créer une nouvelle imagerie
export async function createImagerie(data: {
  type: string;
  urlImage: string;
  compteRenduId?: number;
  rendezVousId: number;
}): Promise<Imagerie> {
  // Ne pas inclure compteRenduId si il est 0 ou undefined
  const payload: any = {
    type: data.type,
    urlImage: data.urlImage,
    rendezVousId: data.rendezVousId,
  };
  
  if (data.compteRenduId && data.compteRenduId > 0) {
    payload.compteRenduId = data.compteRenduId;
  }

  const res = await fetch(`${API_URL}/imageries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMessage = "Impossible de créer l'imagerie";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const errorText = await res.text();
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

// Mettre à jour une imagerie
export async function updateImagerie(
  id: number,
  data: Partial<{
    type: string;
    urlImage: string;
    compteRenduId?: number;
    rendezVousId?: number;
  }>
): Promise<Imagerie> {
  // Ne pas inclure les champs vides ou undefined
  const payload: any = {};
  
  if (data.type && data.type.trim() !== "") {
    payload.type = data.type;
  }
  if (data.urlImage && data.urlImage.trim() !== "") {
    payload.urlImage = data.urlImage;
  }
  if (data.compteRenduId && data.compteRenduId > 0) {
    payload.compteRenduId = data.compteRenduId;
  }
  if (data.rendezVousId && data.rendezVousId > 0) {
    payload.rendezVousId = data.rendezVousId;
  }

  const res = await fetch(`${API_URL}/imageries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMessage = "Impossible de mettre à jour l'imagerie";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const errorText = await res.text();
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

// Supprimer une imagerie
export async function deleteImagerie(id: number): Promise<boolean> {
  const res = await fetch(`${API_URL}/imageries/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Impossible de supprimer l'imagerie");
  return true;
}

// Uploader et créer une imagerie
export async function uploadAndSaveImagerie(
  file: File,
  data: {
    type: string;
    rendezVousId: number;
    compteRenduId?: number;
  }
): Promise<Imagerie> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("type", data.type);
  formData.append("rendezVousId", data.rendezVousId.toString());
  // Ne pas envoyer compteRenduId si il est 0 ou undefined
  if (data.compteRenduId && data.compteRenduId > 0) {
    formData.append("compteRenduId", data.compteRenduId.toString());
  }

  const res = await fetch(`${API_URL}/imageries/upload-and-save`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let errorMessage = "Impossible d'uploader l'image";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const errorText = await res.text();
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return res.json();
}
