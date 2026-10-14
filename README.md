# Lilla stjärna

En svensk, responsiv sagosida som kan publiceras gratis med GitHub Pages. Sagorna skapas i webbläsaren och sparas lokalt på enheten. AI-uppläsningen görs av ElevenLabs Eleven v3, med känslomarkeringar och val mellan tillgängliga röster.

Besökaren kan antingen skapa en saga med namn, djur och plats eller klistra in en egen färdig saga som fritext. Den egna texten kan få en valfri titel och sparas lokalt på samma sätt som en skapad saga. AI-uppläsningen stöder upp till 5 000 tecken per saga.

## AI-uppläsning

GitHub Pages är statiskt och kan inte skydda en gemensam API-nyckel. Därför behöver varje användare ansluta sin egen ElevenLabs-nyckel i berättarvyn. ElevenLabs har för närvarande en gratisnivå med 10 000 text-till-tal-tecken per månad; kontrollera deras [aktuella planer](https://elevenlabs.io/pricing), eftersom villkoren kan ändras.

1. Skapa ett gratis konto hos [ElevenLabs](https://elevenlabs.io/app/sign-up).
2. Skapa en personlig API-nyckel i [API-inställningarna](https://elevenlabs.io/app/settings/api-keys).
3. Klistra in nyckeln i berättarvyn och hämta AI-rösterna.

Nyckeln hålls bara i sidans minne om inte **Kom ihåg nyckeln på den här enheten** markeras. När en saga läses upp skickas texten direkt från webbläsaren till ElevenLabs. Eleven v3 används för uttrycksfull uppläsning; temporeglaget ändrar hastigheten på det färdiga AI-ljudet. Ingen inbyggd webbläsarröst används som ersättning.

## Publicera med GitHub Pages

Lägg `index.html`, `styles.css`, `app.js` och `README.md` i repo-roten. Under repo-inställningarnas **Pages**, välj **Deploy from a branch**, grenen `main` och mappen `/ (root)`.
