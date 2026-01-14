import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";

export function SignUpForm() {
  return (
    <ShowcaseSection title="Formulaire d'Inscription" className="!p-6.5">
      <form action="#">
        <InputGroup
          label="Nom"
          type="text"
          placeholder="Entrez votre nom complet"
          className="mb-4.5"
        />

        <InputGroup
          label="Email"
          type="email"
          placeholder="Entrez votre adresse email"
          className="mb-4.5"
        />

        <InputGroup
          label="Mot de passe"
          type="password"
          placeholder="Entrez votre mot de passe"
          className="mb-4.5"
        />

        <InputGroup
          label="Confirmer le mot de passe"
          type="password"
          placeholder="Retapez votre mot de passe"
          className="mb-5.5"
        />

        <button className="flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90">
          S'inscrire
        </button>
      </form>
    </ShowcaseSection>
  );
}
