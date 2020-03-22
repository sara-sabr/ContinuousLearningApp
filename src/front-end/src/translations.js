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
                    "Submit": "Submit"
                }
            },
            fr: {
                translation: {
                    "GCShare": "GCPartager",
                    "Home": "Accueil",
                    "Links": "Liens",
                    "Submit": "Soumettre"
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