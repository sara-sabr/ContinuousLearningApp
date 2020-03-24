import i18n from "i18next"
import { initReactI18next } from "react-i18next"

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    // Navigation.js
                    "GCShare": "GCShare",
                    "Home": "Home",
                    "Links": "Links",
                    "Submit": "Submit",
                    "Navigation": "Navigation",
                    // LinkForm.js
                    "Add a link 🎉": "Add a link 🎉",
                    "link explanation": "Have a link! That's fantastic 👏. Insert you're link and press next, we'll autofill as much as we can 🔥! If the link already exists, we'll redirect you to it 🎩",
                    "Link": "Link",
                    "yourawesomelink": "https://yourawesomelink.ca",
                    "insert your link here": "insert your link here",
                    "Next": "Suivant",
                    "link help": "A link must have a protocol either http or https, a host, and a tld ( i.e. .ca ). Example: https://yourawesomelink.ca",
                    "link does not exist": "Seems like this link doesn't exist 😨! Check your link and make sure it is the correct one.",
                    "link error": "We can't seem to get a valid response from this link 🧐. It may be temporarily down. Try adding it again later 😄!",
                    "fetching metadata": "Hold on 🐎! We're fetching some metadata on your link !"
                }
            },
            fr: {
                translation: {
                    // Navigation.js
                    "GCShare": "GCPartager",
                    "Home": "Accueil",
                    "Links": "Liens",
                    "Submit": "Soumettre",
                    "Navigation": "Navigation",
                    // LinkForm.js
                    "Add a link 🎉": "Ajouter un lien 🎉",
                    "link explanation": "Ayez un lien! C'est fantastique 👏. Insérez votre lien et appuyez sur suivant, nous remplirons autant que possible 🔥! Si le lien existe déjà, nous vous rediriger vers elle 🎩",
                    "Link": "Lien",
                    "yourawesomelink": "https://votreliengénial.ca",
                    "insert your link here": "insérez votre lien ici",
                    "Next": "Suivant",
                    "link help": "Un lien doit avoir un protocole http ou https, un hôte et un tld (c'est-à-dire .ca). Example: https://votreliengénial.ca",
                    "link does not exist": "Il semblerait que ce lien n'existe pas 😨! Vérifiez votre lien et assurez-vous qu'il s'agit bien du bon.",
                    "link error": "Il semble que nous ne puissions pas obtenir de réponse valable à partir de ce lien 🧐. Il est possible qu'il soit temporairement hors service. Essayez de l'ajouter à nouveau plus tard 😄!",
                    "fetching metadata": "Attendez sur 🐎 ! Nous allons chercher des métadonnées sur votre lien !"
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