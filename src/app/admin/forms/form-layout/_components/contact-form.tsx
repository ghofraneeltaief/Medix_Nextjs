import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { Select } from "@/components/FormElements/select";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";

export function ContactForm() {
  return (
    <ShowcaseSection title="Formulaire de Contact" className="!p-6.5">
      <form action="#">
        <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
          <InputGroup
            label="Prénom"
            type="text"
            placeholder="Entrez votre prénom"
            className="w-full xl:w-1/2"
          />

          <InputGroup
            label="Nom"
            type="text"
            placeholder="Entrez votre nom"
            className="w-full xl:w-1/2"
          />
        </div>

        <InputGroup
          label="Email"
          type="email"
          placeholder="Entrez votre adresse email"
          className="mb-4.5"
          required
        />

        <InputGroup
          label="Sujet"
          type="text"
          placeholder="Entrez votre sujet"
          className="mb-4.5"
        />

        <Select
          label="Sujet"
          placeholder="Sélectionnez votre sujet"
          className="mb-4.5"
          items={[
            { label: "États-Unis", value: "USA" },
            { label: "Royaume-Uni", value: "UK" },
            { label: "Canada", value: "Canada" },
          ]}
        />

        <TextAreaGroup label="Message" placeholder="Tapez votre message" />

        <button className="mt-6 flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90">
          Envoyer le message
        </button>
      </form>
    </ShowcaseSection>
  );
}
