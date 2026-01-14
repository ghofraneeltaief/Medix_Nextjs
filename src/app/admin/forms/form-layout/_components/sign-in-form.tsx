import { Checkbox } from "@/components/FormElements/checkbox";
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Link from "next/link";

export function SignInForm() {
  return (
    <ShowcaseSection title="Formulaire de Connexion" className="!p-6.5">
      <form action="#">
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
        />

        <div className="mb-5.5 mt-5 flex items-center justify-between">
          <Checkbox label="Se souvenir de moi" minimal withBg withIcon="check" />

          <Link href="#" className="text-body-sm text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>

        <button className="flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90">
          Se connecter
        </button>
      </form>
    </ShowcaseSection>
  );
}
