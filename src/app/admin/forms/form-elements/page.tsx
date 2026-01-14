import type { Metadata } from "next";

import { GlobeIcon } from "@/assets/icons";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DatePickerOne from "@/components/FormElements/DatePicker/DatePickerOne";
import DatePickerTwo from "@/components/FormElements/DatePicker/DatePickerTwo";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import MultiSelect from "@/components/FormElements/MultiSelect";
import { Checkbox } from "@/components/FormElements/checkbox";
import { RadioInput } from "@/components/FormElements/radio";
import { Select } from "@/components/FormElements/select";
import { Switch } from "@/components/FormElements/switch";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";

export const metadata: Metadata = {
  title: "Éléments de Formulaire",
};

export default function FormElementsPage() {
  return (
    <>
      <Breadcrumb pageName="Éléments de Formulaire" />

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          <ShowcaseSection title="Champs de saisie" className="space-y-5.5 !p-6.5">
            <InputGroup
              label="Saisie par défaut"
              placeholder="Texte de saisie par défaut"
              type="text"
            />

            <InputGroup
              label="Saisie active"
              placeholder="Texte de saisie active"
              active
              type="text"
            />

            <InputGroup
              label="Saisie désactivée"
              placeholder="Texte de saisie désactivée"
              type="text"
              disabled
            />
          </ShowcaseSection>

          <ShowcaseSection
            title="Interrupteur à bascule"
            className="space-y-5.5 !p-6.5"
          >
            <Switch />
            <Switch backgroundSize="sm" />
            <Switch withIcon />
            <Switch background="dark" />
          </ShowcaseSection>

          <ShowcaseSection title="Heure et date" className="space-y-5.5 !p-6.5">
            <DatePickerOne />
            <DatePickerTwo />
          </ShowcaseSection>

          <ShowcaseSection title="Téléchargement de fichier" className="space-y-5.5 !p-6.5">
            <InputGroup
              type="file"
              fileStyleVariant="style1"
              label="Joindre un fichier"
              placeholder="Joindre un fichier"
            />

            <InputGroup
              type="file"
              fileStyleVariant="style2"
              label="Joindre un fichier"
              placeholder="Joindre un fichier"
            />
          </ShowcaseSection>
        </div>

        <div className="flex flex-col gap-9">
          <ShowcaseSection title="Zones de texte" className="space-y-6 !p-6.5">
            <TextAreaGroup
              label="Zone de texte par défaut"
              placeholder="Zone de texte par défaut"
            />

            <TextAreaGroup
              label="Zone de texte active"
              placeholder="Zone de texte active"
              active
            />

            <TextAreaGroup
              label="Zone de texte désactivée"
              placeholder="Zone de texte désactivée"
              disabled
            />
          </ShowcaseSection>

          <ShowcaseSection title="Sélection" className="space-y-5.5 !p-6.5">
            <Select
              label="Sélectionner un pays"
              items={[
                { label: "États-Unis", value: "USA" },
                { label: "Royaume-Uni", value: "UK" },
                { label: "Canada", value: "Canada" },
              ]}
              defaultValue="USA"
              prefixIcon={<GlobeIcon />}
            />
            <MultiSelect id="multiSelect" />
          </ShowcaseSection>

          <ShowcaseSection
            title="Cases à cocher et boutons radio"
            className="space-y-5.5 !p-6.5"
          >
            <Checkbox label="Texte de case à cocher" />
            <Checkbox label="Texte de case à cocher" withIcon="check" />
            <Checkbox label="Texte de case à cocher" withIcon="x" />
            <RadioInput label="Texte de bouton radio" />
            <RadioInput label="Texte de bouton radio" variant="circle" />
          </ShowcaseSection>
        </div>
      </div>
    </>
  );
}
