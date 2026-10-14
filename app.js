(() => {
  const form = document.querySelector('#story-form');
  const storySection = document.querySelector('#story-section');
  const storyTitle = document.querySelector('#story-title');
  const storyText = document.querySelector('#story-text');
  const voiceSelect = document.querySelector('#voice-select');
  const voiceNote = document.querySelector('#voice-note');
  const speedControl = document.querySelector('#speed-control');
  const speedValue = document.querySelector('#speed-value');
  const readButton = document.querySelector('#read-button');
  const pauseButton = document.querySelector('#pause-button');
  const stopButton = document.querySelector('#stop-button');
  const aiAudio = document.querySelector('#ai-audio');
  const apiKeyForm = document.querySelector('#api-key-form');
  const apiKeyInput = document.querySelector('#api-key');
  const rememberApiKey = document.querySelector('#remember-api-key');
  const connectButton = document.querySelector('#connect-ai');
  const voiceSetup = document.querySelector('#voice-setup');
  const saveButton = document.querySelector('#save-button');
  const saveStatus = document.querySelector('#save-status');
  const savedArea = document.querySelector('#saved-area');
  const savedList = document.querySelector('#saved-list');
  let currentStory = null;
  let voices = [];
  let aiApiKey = '';
  let selectedFriend = 'en nyfiken liten räv';
  let selectedPlace = 'i en hemlig skog';
  let playbackId = 0;
  let generationBusy = false;
  let requestController = null;
  let generatedAudioUrl = '';
  let generatedAudioKey = '';

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

  function cleanText(value, maxLength, fallback = '') {
    return (value || '').replace(/[<>]/g, '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength) || fallback;
  }
  function titleFor(name, friend) { return `${name} på äventyr med ${friend}`; }
  function buildStory(name, friend, place, length) {
    const options = stories[length] || stories.mellan;
    const make = options[Math.floor(Math.random() * options.length)];
    return { title: titleFor(name, friend), text: make(name, friend, place), name, friend, place, length, created: Date.now() };
  }
  function showStory(story) {
    clearAudioCache();
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
    const customFriend = cleanText(document.querySelector('#custom-friend').value, 50);
    const customPlace = cleanText(document.querySelector('#custom-place').value, 60);
    const friend = customFriend ? /^(en|ett)\s/i.test(customFriend) ? customFriend : `en ${customFriend}` : selectedFriend;
    const place = customPlace || selectedPlace;
    showStory(buildStory(cleanText(document.querySelector('#child-name').value, 24, 'Luna'), friend, place, document.querySelector('#length').value));
  });
  document.querySelector('#new-story').addEventListener('click', () => {
    stopReading();
    storySection.classList.add('hidden');
    document.querySelector('#skapa').scrollIntoView({ behavior: 'smooth' });
  });

  const fallbackVoices = [
    { voice_id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Varm sagoberättare' },
    { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Mjuk och trygg' },
    { voice_id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', description: 'Ljus och lekfull' },
    { voice_id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', description: 'Lugn och neutral' },
    { voice_id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', description: 'Mjuk och varm' },
    { voice_id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', description: 'Djup och rogivande' },
    { voice_id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', description: 'Avslappnad och varm' }
  ];
  const recommendedVoices = new Map(fallbackVoices.map((voice, index) => [voice.voice_id, index]));
  const specialVoiceNames = new Map(fallbackVoices.map(voice => [voice.voice_id, `${voice.name} — ${voice.description}`]));
  const savedKeyName = 'lilla-stjarna-elevenlabs-key';

  function setVoiceStatus(message, state = '') {
    voiceNote.textContent = message;
    if (state) voiceNote.dataset.state = state;
    else delete voiceNote.dataset.state;
  }
  function voiceLabel(voice) {
    if (specialVoiceNames.has(voice.voice_id)) return specialVoiceNames.get(voice.voice_id);
    const rawName = voice.name || 'AI-röst';
    return rawName.replace(/\s+-\s+/g, ' — ');
  }
  function updateVoiceOptions(nextVoices) {
    const previous = voiceSelect.value;
    voices = nextVoices.filter(voice => voice && voice.voice_id && voice.name).sort((a, b) => {
      const aRank = recommendedVoices.has(a.voice_id) ? recommendedVoices.get(a.voice_id) : 99;
      const bRank = recommendedVoices.has(b.voice_id) ? recommendedVoices.get(b.voice_id) : 99;
      return aRank - bRank || voiceLabel(a).localeCompare(voiceLabel(b), 'sv');
    });
    voiceSelect.replaceChildren();
    voices.forEach(voice => voiceSelect.add(new Option(voiceLabel(voice), voice.voice_id)));
    const selected = voices.some(voice => voice.voice_id === previous) ? previous :
      voices.some(voice => voice.voice_id === 'JBFqnCBsd6RMkjVDRZzb') ? 'JBFqnCBsd6RMkjVDRZzb' : voices[0]?.voice_id;
    if (selected) voiceSelect.value = selected;
  }
  async function requestVoiceList(key = '') {
    const headers = key ? { 'xi-api-key': key } : {};
    const response = await fetch('https://api.elevenlabs.io/v1/voices', { headers });
    if (!response.ok) {
      const error = new Error(`ElevenLabs svarade med fel ${response.status}.`);
      error.status = response.status;
      throw error;
    }
    const data = await response.json();
    return Array.isArray(data.voices) ? data.voices : [];
  }
  function explainApiError(error) {
    if (error.name === 'AbortError') return '';
    if (error.status === 401) return 'Nyckeln godkändes inte. Kontrollera den och försök igen.';
    if (error.status === 402 || error.status === 429) return 'ElevenLabs-kontots fria tecken eller anropsgräns verkar vara slut. Kontrollera kontots användning och försök igen senare.';
    if (error.status === 403) return 'Nyckeln saknar åtkomst till AI-röster. Skapa en ny API-nyckel i ElevenLabs-inställningarna.';
    if (error instanceof TypeError) return 'Kunde inte nå ElevenLabs. Kontrollera internetanslutningen och försök igen.';
    return error.message || 'AI-uppläsningen misslyckades. Försök igen.';
  }
  function storeKeyChoice(key) {
    try {
      if (rememberApiKey.checked && key) localStorage.setItem(savedKeyName, key);
      else localStorage.removeItem(savedKeyName);
      return true;
    } catch {
      return false;
    }
  }
  async function initializeVoiceSetup() {
    updateVoiceOptions(fallbackVoices);
    try { aiApiKey = localStorage.getItem(savedKeyName) || ''; } catch { aiApiKey = ''; }
    rememberApiKey.checked = Boolean(aiApiKey);
    if (aiApiKey) {
      setVoiceStatus('Kontrollerar den sparade AI-nyckeln…', 'working');
      try {
        const available = await requestVoiceList(aiApiKey);
        if (available.length) updateVoiceOptions(available);
        voiceSetup.open = false;
        connectButton.textContent = 'Uppdatera AI-röster';
        setVoiceStatus(`AI-uppläsning redo med ${voices.length} röster. Sagan skickas direkt till ElevenLabs när du startar uppläsningen.`, 'ready');
      } catch (error) {
        voiceSetup.open = true;
        setVoiceStatus(explainApiError(error), 'error');
      }
      return;
    }
    try {
      const available = await requestVoiceList();
      if (available.length) updateVoiceOptions(available);
    } catch {
      // The curated AI voices stay available if the public voice list cannot load.
    }
  }
  void initializeVoiceSetup();

  apiKeyForm.addEventListener('submit', async event => {
    event.preventDefault();
    const submittedKey = apiKeyInput.value.trim() || aiApiKey;
    if (!submittedKey) {
      setVoiceStatus('Klistra först in din gratis API-nyckel från ElevenLabs.', 'error');
      apiKeyInput.focus();
      return;
    }
    connectButton.disabled = true;
    connectButton.textContent = 'Ansluter…';
    setVoiceStatus('Kontrollerar nyckeln och hämtar röster…', 'working');
    try {
      const available = await requestVoiceList(submittedKey);
      if (!available.length) throw new Error('Inga AI-röster hittades på kontot.');
      aiApiKey = submittedKey;
      updateVoiceOptions(available);
      const keySaved = storeKeyChoice(aiApiKey);
      apiKeyInput.value = '';
      voiceSetup.open = false;
      const storageNote = rememberApiKey.checked && !keySaved ? ' Nyckeln kunde inte sparas på enheten.' : '';
      setVoiceStatus(`Anslutet: ${voices.length} AI-röster. Välj en och tryck ”Lyssna med AI”.${storageNote}`, 'ready');
    } catch (error) {
      setVoiceStatus(explainApiError(error), 'error');
    } finally {
      connectButton.disabled = false;
      connectButton.textContent = aiApiKey ? 'Uppdatera AI-röster' : 'Hämta AI-röster';
    }
  });

  function setPlayback(active) {
    pauseButton.disabled = !active;
    stopButton.disabled = !active && !generationBusy;
    readButton.disabled = generationBusy;
    readButton.querySelector('span').textContent = generationBusy ? 'Skapar AI-röst…' : 'Lyssna med AI';
  }
  function stopReading() {
    const wasGenerating = generationBusy && Boolean(requestController);
    playbackId += 1;
    if (requestController) requestController.abort();
    requestController = null;
    generationBusy = false;
    aiAudio.pause();
    try { if (aiAudio.readyState > 0) aiAudio.currentTime = 0; } catch { /* Some browsers wait for metadata before seeking. */ }
    setPlayback(false);
    pauseButton.textContent = 'Pausa';
    if (wasGenerating) setVoiceStatus('AI-uppläsningen stoppades.', '');
  }
  function clearAudioCache() {
    stopReading();
    if (generatedAudioUrl) URL.revokeObjectURL(generatedAudioUrl);
    generatedAudioUrl = '';
    generatedAudioKey = '';
    aiAudio.removeAttribute('src');
    aiAudio.load();
  }
  function currentAudioKey() {
    if (!currentStory) return '';
    return `${currentStory.created || currentStory.title}:${voiceSelect.value}`;
  }
  async function playCachedAudio() {
    if (!generatedAudioUrl) return;
    aiAudio.playbackRate = Number(speedControl.value);
    if ('preservesPitch' in aiAudio) aiAudio.preservesPitch = true;
    if ('webkitPreservesPitch' in aiAudio) aiAudio.webkitPreservesPitch = true;
    try {
      await aiAudio.play();
    } catch {
      setVoiceStatus('AI-ljudet är klart. Tryck på ”Lyssna med AI” igen för att spela upp det.', 'ready');
    }
  }
  function addPerformanceCues(text) {
    const paragraphs = text.split(/\n\s*\n/).map(paragraph => paragraph.trim()).filter(Boolean);
    return paragraphs.map((paragraph, index) => {
      let line = paragraph;
      line = line.replace(/([“"])([^”"]*\?[^”"]*)([”"])/g, '[curious] $1$2$3');
      if (/\bviskade\b/i.test(line)) line = line.replace(/([“"])([^”"]+)([”"])/, '[whispers] $1$2$3');
      const bedtimeEnding = index === paragraphs.length - 1 || /god natt|somnade|somna|sov\b/i.test(line);
      const cue = index === 0 ? '[warmly] ' : bedtimeEnding ? '[softly] ' : '';
      return cue + line;
    }).join('\n\n');
  }
  function apiPlaybackMessage(error) {
    if (error.status === 401) return 'Nyckeln avvisades. Öppna inställningen och kontrollera den.';
    if (error.status === 402 || error.status === 429) return 'ElevenLabs verkar ha nått kontots fria tecken eller anropsgräns för stunden.';
    if (error.status === 403) return 'Kontot eller nyckeln saknar åtkomst till den här AI-rösten.';
    if (error.status === 422) return 'AI-tjänsten kunde inte skapa ljud för texten. Prova en annan röst.';
    return explainApiError(error);
  }
  readButton.addEventListener('click', async () => {
    if (!currentStory || generationBusy) return;
    const audioKey = currentAudioKey();
    if (generatedAudioUrl && generatedAudioKey === audioKey) {
      await playCachedAudio();
      return;
    }
    if (!aiApiKey) {
      voiceSetup.open = true;
      setVoiceStatus('För att skapa berättarrösten behövs en gratis ElevenLabs-nyckel. Webbläsarens inbyggda röst används inte.', 'error');
      apiKeyInput.focus();
      return;
    }
    if (!voiceSelect.value) {
      setVoiceStatus('Välj en AI-berättarröst först.', 'error');
      return;
    }
    const storyForAI = addPerformanceCues(currentStory.text);
    if (storyForAI.length > 5000) {
      setVoiceStatus('Den här sagan är för lång för en AI-uppläsning. Välj en kortare saga.', 'error');
      return;
    }
    stopReading();
    const id = playbackId;
    requestController = new AbortController();
    generationBusy = true;
    setPlayback(false);
    setVoiceStatus('AI-berättaren gör rösten redo. Det kan ta en liten stund…', 'working');
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceSelect.value)}?output_format=mp3_44100_128`, {
        method: 'POST',
        headers: { 'xi-api-key': aiApiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: storyForAI,
          model_id: 'eleven_v3',
          language_code: 'sv',
          voice_settings: { stability: 0.38, similarity_boost: 0.82, style: 0.3, use_speaker_boost: true }
        }),
        signal: requestController.signal
      });
      if (!response.ok) {
        let detail = '';
        try {
          const payload = await response.json();
          detail = payload.detail?.message || payload.detail || '';
        } catch { /* A plain-text API error is handled by its status code. */ }
        const error = new Error(typeof detail === 'string' ? detail : `ElevenLabs fel ${response.status}.`);
        error.status = response.status;
        throw error;
      }
      const audioBlob = await response.blob();
      if (id !== playbackId) return;
      if (!audioBlob.type.startsWith('audio/')) throw new Error('ElevenLabs skickade inget ljud.');
      if (generatedAudioUrl) URL.revokeObjectURL(generatedAudioUrl);
      generatedAudioUrl = URL.createObjectURL(audioBlob);
      generatedAudioKey = audioKey;
      aiAudio.src = generatedAudioUrl;
      aiAudio.load();
      generationBusy = false;
      requestController = null;
      setPlayback(false);
      setVoiceStatus('AI-rösten är klar. Berättartempot kan ändras medan sagan spelas.', 'ready');
      await playCachedAudio();
    } catch (error) {
      if (id !== playbackId || error.name === 'AbortError') return;
      generationBusy = false;
      requestController = null;
      setPlayback(false);
      setVoiceStatus(apiPlaybackMessage(error), 'error');
    }
  });
  pauseButton.addEventListener('click', async () => {
    if (aiAudio.paused) {
      await playCachedAudio();
      pauseButton.textContent = 'Pausa';
    } else {
      aiAudio.pause();
      pauseButton.textContent = 'Fortsätt';
    }
  });
  stopButton.addEventListener('click', stopReading);
  aiAudio.addEventListener('play', () => {
    setPlayback(true);
    pauseButton.textContent = 'Pausa';
    setVoiceStatus('AI-berättaren läser upp sagan.', 'ready');
  });
  aiAudio.addEventListener('pause', () => {
    if (!generationBusy) setPlayback(false);
  });
  aiAudio.addEventListener('ended', () => {
    setPlayback(false);
    pauseButton.textContent = 'Pausa';
    setVoiceStatus('Sagan är slut. Tryck ”Lyssna med AI” om du vill höra den igen.', 'ready');
  });
  voiceSelect.addEventListener('change', () => {
    clearAudioCache();
    if (aiApiKey) setVoiceStatus('Röst vald. Tryck ”Lyssna med AI” för att skapa uppläsningen.', 'ready');
  });
  speedControl.addEventListener('input', () => {
    speedValue.value = `${Number(speedControl.value).toFixed(2).replace('.', ',')}×`;
    speedValue.textContent = speedValue.value;
    aiAudio.playbackRate = Number(speedControl.value);
    if ('preservesPitch' in aiAudio) aiAudio.preservesPitch = true;
    if ('webkitPreservesPitch' in aiAudio) aiAudio.webkitPreservesPitch = true;
  });

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
