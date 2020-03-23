import i18n from "i18next"
import { initReactI18next } from "react-i18next"

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    "GCShare": "GCShare",
                    "Home": "Home",
                    "Links": "Links",
                    "Submit": "Submit",
                    "Navigation": "Navigation",
                    "Add a link 🎉": "Add a link 🎉",
                    "link explanation": "Have a link! That's fantastic 👏. Insert you're link and press next, we'll autofill as much as we can 🔥! If the link already exists, we'll redirect you to it 🎩",
                    "Link": "Link",
                    "yourawesomelink": "https://yourawesomelink.ca",
                    "insert your link here": "insert your link here",
                    "link help": "A link must have a protocol either http or https, a host, and a tld ( i.e. .ca ). Example: https://yourawesomelink.ca",
                    "Next": "Suivant"
                }
            },
            fr: {
                translation: {
                    "GCShare": "GCPartager",
                    "Home": "Accueil",
                    "Links": "Liens",
                    "Submit": "Soumettre",
                    "Navigation": "Navigation",
                    "Add a link 🎉": "Ajouter un lien 🎉",
                    "link explanation": "Ayez un lien! C'est fantastique 👏. Insérez votre lien et appuyez sur suivant, nous remplirons autant que possible 🔥! Si le lien existe déjà, nous vous rediriger vers elle 🎩",
                    "Link": "Lien",
                    "yourawesomelink": "https://votreliengénial.ca",
                    "insert your link here": "insérez votre lien ici",
                    "link help": "Un lien doit avoir un protocole http ou https, un hôte et un tld (c'est-à-dire .ca). Example: https://votreliengénial.ca",
                    "Next": "Suivant"
                }
            }
        },
        lng: "en",
        fallbackLng: "en",

        interpolation: {
            escapeValue: false
        }    
    })

export default i18n