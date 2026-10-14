(() => {
  const form = document.querySelector('#story-form');
  const storySection = document.querySelector('#story-section');
  const storyTitle = document.querySelector('#story-title');
  const storyText = document.querySelector('#story-text');
  const voiceSelect = document.querySelector('#voice-select');
  const voiceNote = document.querySelector('#voice-note');
  const readButton = document.querySelector('#read-button');
  const pauseButton = document.querySelector('#pause-button');
  const stopButton = document.querySelector('#stop-button');
  const saveButton = document.querySelector('#save-button');
  const saveStatus = document.querySelector('#save-status');
  const savedArea = document.querySelector('#saved-area');
  const savedList = document.querySelector('#saved-list');
  const speech = window.speechSynthesis;
  let currentStory = null;
  let voices = [];
  let selectedFriend = 'en nyfiken liten räv';
  let selectedPlace = 'i en hemlig skog';
  let activeUtterance = null;

  function wireChoices(groupId, setter) {
    document.querySelectorAll(`#${groupId} .choice-pill`).forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll(`#${groupId} .choice-pill`).forEach(item => item.classList.remove('selected'));
        button.classList.add('selected');
        setter(button.dataset.value);
      });
    });
  }
  wireChoices('friend-choices', value => { selectedFriend = value; });
  wireChoices('place-choices', value => { selectedPlace = value; });

  const stories = {
    kort: [
      (n,f,p) => `${n} och ${f} var ${p}. Plötsligt hittade de en liten stjärna som hade trillat ner bland blåbären. "Jag hittar inte hem", viskade stjärnan. ${n} och vännen byggde en stege av månstrålar och hjälpte den upp till himlen igen. Stjärnan blinkade tack och lyste lite extra hela natten. Sedan gäspade ${n}, kröp ner i sin varma säng och somnade med ett leende.`,
      (n,f,p) => `En kväll när ${n} och ${f} var ${p} hörde de ett mjukt pling. En liten silverklocka låg under en mossig sten. När ${n} ringde i den vaknade blommorna och sjöng en vaggvisa. "Den är till dig", sa vännen. ${n} stoppade klockan i fickan och tog med sig sången hem. Snart sov både hjälten och hela skogen sött.`
    ],
    mellan: [
      (n,f,p) => `När skymningen målade himlen rosa gick ${n} och ${f} på upptäcktsfärd ${p}. Bakom en gammal stubbe fann de en liten stjärna som darrade på mossan. "Jag skulle lysa på månfesten, men jag har tappat bort min glans", sa den.\n\n${n} tänkte efter. Kanske behövde stjärnan inte mer ljus, utan lite hjälp att hitta hem. Tillsammans följde de en bäck som glittrade som ett silversnöre. Längs vägen frågade de ugglan, som pekade med vingen, och igelkotten, som rullade dem hela vägen till den högsta kullen.\n\nDär väntade månen. ${n} höll upp stjärnan och vännen gav den en varm kram. Då började stjärnan lysa, först försiktigt och sedan starkare än någonsin. "Min glans kom tillbaka när jag fick hjälp", sa den. Den flög upp och tog sin plats bredvid månen.\n\n${n} vinkade godnatt. På vägen hem lät vinden som en vaggvisa. Väl i sängen kändes täcket mjukt och tryggt. Stjärnan blinkade genom fönstret, och ${n} somnade medan natten höll världen stilla.`,
      (n,f,p) => `Det var en alldeles stilla kväll när ${n} och ${f} hörde ett pyttelitet "hallå" ${p}. En snigel med en röd halsduk stod vid stigen. Han hade bråttom till sin mormor med en burk honung, men vägen hade blivit alldeles mörk.\n\n"Vi följer dig", sa ${n}. Vännen gick först och lyste med en liten lykta. De passerade sovande blommor och en groda som nynnade på en visa. När stigen delade sig visste ingen vilken väg de skulle ta. Då mindes ${n} att mormors stuga låg nära den stora eken.\n\nSnart syntes ett varmt fönster mellan träden. Snigelns mormor tog emot dem med nybakade kanelbullar och tackade för sällskapet. Hon gav ${n} och vännen varsin liten honungsdroppe att smaka på. Den smakade sol och sommar.\n\nPå vägen hem gäspade ${n}. Månen lyste som en nattlampa och vännen gick alldeles nära. Hemma väntade den mjuka kudden. "God natt, lilla äventyrare", viskade natten. Och snart sov ${n} gott.`
    ],
    lang: [
      (n,f,p) => `En gång, när dagen just hade sagt god natt, packade ${n} en liten ryggsäck och mötte ${f} ${p}. De hade fått ett brev från månen: någon hade glömt att tända nattens lyktor.\n\nFörst följde de en stig av lysande svampar. Ugglan vaktade bron över bäcken och släppte bara förbi dem som kunde säga något snällt. ${n} sa att vännen var modig, och vännen sa att ${n} alltid var bra på att hitta vägen. Bron gnistrade till och lät dem passera.\n\nPå andra sidan väntade ett tåg byggt av löv. Konduktören, en liten grävling med grön mössa, visade dem till sista vagnen. Tåget for uppför kullarna, förbi sovande byar och ända fram till molnens kant. Där stod nattens lykttändare och såg bekymrad ut. Alla lyktor hade slocknat.\n\n${n} fick en idé. Vännen samlade daggdroppar medan grävlingen höll lyktorna stilla. När de lade dropparna i glasen fångade de månens sken och hela natten tändes igen, en lykta i taget. Små stjärnor började dansa av glädje.\n\nSom tack fick ${n} en fjäder från ett moln att ha under kudden. Tåget tog dem hem medan världen blev tystare och tystare. ${n} lade fjädern på nattduksbordet, kröp ner och kände sig trygg. Utanför blinkade lyktorna en sista godnattshälsning. Sedan slöt ${n} ögonen och drömde om nästa vänliga äventyr.`
    ]
  };

  function cleanName(value) {
    const name = (value || '').trim().replace(/[<>]/g, '');
    return name.slice(0, 24) || 'Luna';
  }
  function titleFor(name, friend) {
    const buddy = friend.includes('räv') ? 'räven' : friend.includes('björn') ? 'björnen' : friend.includes('kanin') ? 'kaninen' : 'draken';
    return `${name} och ${buddy} hittar en stjärna`;
  }
  function buildStory(name, friend, place, length) {
    const options = stories[length] || stories.mellan;
    const make = options[Math.floor(Math.random() * options.length)];
    return { title: titleFor(name, friend), text: make(name, friend, place), name, friend, place, length, created: Date.now() };
  }
  function showStory(story) {
    currentStory = story;
    storyTitle.textContent = story.title;
    storyText.replaceChildren(...story.text.split('\n\n').map(paragraph => {
      const p = document.createElement('p'); p.textContent = paragraph; return p;
    }));
    storySection.classList.remove('hidden');
    storySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    saveStatus.textContent = 'Sparas bara på den här enheten';
    saveButton.textContent = '♡ Spara saga';
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    stopReading();
    showStory(buildStory(cleanName(document.querySelector('#child-name').value), selectedFriend, selectedPlace, document.querySelector('#length').value));
  });
  document.querySelector('#new-story').addEventListener('click', () => {
    stopReading();
    storySection.classList.add('hidden');
    document.querySelector('#skapa').scrollIntoView({ behavior: 'smooth' });
  });

  function loadVoices() {
    if (!speech) {
      voiceSelect.innerHTML = '<option value="">Tal saknas i webbläsaren</option>';
      voiceNote.textContent = 'Den här webbläsaren har inte uppläsning aktiverad. Prova Safari, Chrome eller Edge på en enhet med svenska röster.';
      readButton.disabled = true;
      return;
    }
    voices = speech.getVoices();
    const swedish = voices.filter(voice => /^sv([-_]|$)/i.test(voice.lang));
    const choices = swedish.length ? swedish : voices;
    voiceSelect.replaceChildren();
    if (!choices.length) {
      voiceSelect.add(new Option('Webbläsarens standardröst', ''));
      voiceNote.textContent = 'Rösterna laddas från din enhet. Om ingen svensk röst finns installerad kan uppläsningen låta annorlunda.';
      return;
    }
    choices.forEach((voice, index) => {
      const option = new Option(`${voice.name}${voice.localService ? '' : ' · online'}`, String(voices.indexOf(voice)));
      voiceSelect.add(option);
      if (voice.default && index === 0) voiceSelect.value = String(voices.indexOf(voice));
    });
    if (swedish.length) {
      const preferred = swedish.find(voice => /natural|premium|enhanced|neural|siri/i.test(voice.name)) || swedish.find(voice => voice.default) || swedish[0];
      voiceSelect.value = String(voices.indexOf(preferred));
      voiceNote.textContent = 'Svenska röster från den här enheten. Rösternas klang och kvalitet varierar mellan webbläsare och enheter.';
    } else {
      voiceNote.textContent = 'Ingen svensk röst hittades på enheten. Installera en svensk uppläsningsröst i enhetens inställningar för bäst resultat.';
    }
  }
  if (speech) {
    loadVoices();
    speech.addEventListener('voiceschanged', loadVoices);
  } else loadVoices();

  function setPlayback(active) {
    pauseButton.disabled = !active;
    stopButton.disabled = !active;
    readButton.querySelector('span').textContent = active ? 'Spelar…' : 'Lyssna igen';
  }
  function stopReading() {
    if (speech) speech.cancel();
    activeUtterance = null;
    setPlayback(false);
  }
  readButton.addEventListener('click', () => {
    if (!currentStory || !speech) return;
    stopReading();
    activeUtterance = new SpeechSynthesisUtterance(currentStory.text.replace(/\n/g, ' '));
    activeUtterance.lang = 'sv-SE';
    const voice = voices[Number(voiceSelect.value)];
    if (voice) { activeUtterance.voice = voice; activeUtterance.lang = voice.lang; }
    activeUtterance.rate = Number(document.querySelector('#speed-select').value);
    activeUtterance.pitch = 0.94;
    activeUtterance.onstart = () => setPlayback(true);
    activeUtterance.onend = () => setPlayback(false);
    activeUtterance.onerror = () => { setPlayback(false); voiceNote.textContent = 'Uppläsningen kunde inte starta. Prova att välja en annan röst.'; };
    speech.speak(activeUtterance);
  });
  pauseButton.addEventListener('click', () => {
    if (!speech) return;
    if (speech.paused) { speech.resume(); pauseButton.textContent = 'Pausa'; }
    else { speech.pause(); pauseButton.textContent = 'Fortsätt'; }
  });
  stopButton.addEventListener('click', stopReading);

  function getSaved() {
    try { return JSON.parse(localStorage.getItem('lilla-stjarna-stories') || '[]'); }
    catch { return []; }
  }
  function renderSaved() {
    const saved = getSaved();
    savedArea.classList.toggle('hidden', saved.length === 0);
    savedList.replaceChildren();
    saved.forEach((story, index) => {
      const row = document.createElement('div'); row.className = 'saved-item';
      const title = document.createElement('button'); title.textContent = story.title; title.addEventListener('click', () => showStory(story));
      const remove = document.createElement('button'); remove.className = 'delete-save'; remove.textContent = 'Ta bort'; remove.setAttribute('aria-label', `Ta bort ${story.title}`);
      remove.addEventListener('click', () => { const all = getSaved(); all.splice(index, 1); localStorage.setItem('lilla-stjarna-stories', JSON.stringify(all)); renderSaved(); });
      const actions = document.createElement('span'); actions.append(title, remove); row.append(actions); savedList.append(row);
    });
  }
  saveButton.addEventListener('click', () => {
    if (!currentStory) return;
    const saved = getSaved();
    saved.unshift(currentStory);
    try {
      localStorage.setItem('lilla-stjarna-stories', JSON.stringify(saved.slice(0, 20)));
      saveStatus.textContent = 'Sagan är sparad på den här enheten';
      saveButton.textContent = '♥ Sparad';
      renderSaved();
    } catch { saveStatus.textContent = 'Kunde inte spara — webbläsarens lagring är full.'; }
  });
  renderSaved();
})();
