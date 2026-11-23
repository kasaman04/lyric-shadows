"""Keep the generated native movie player reusable for real conversation shorts."""

def configure_movie_player(text):
    if 'options.scenes||window.MOVIE_SCENES' in text:
        return text
    changes = [
      ('const scenes=window.MOVIE_SCENES||[];', 'const scenes=options.scenes||window.MOVIE_SCENES||[];'),
      ('const filters=[', 'const filters=(options.filters||['),
      ("  ].filter(filter=>scenes.some(filter.matches));", "  ]).filter(filter=>scenes.some(filter.matches));"),
      ("localStorage.getItem('movie-study-work')", "localStorage.getItem(options.storageKey||'movie-study-work')"),
      ("localStorage.setItem('movie-study-work',key)", "localStorage.setItem(options.storageKey||'movie-study-work',key)"),
      ("validWork(storedWork)?storedWork:'before';", "validWork(storedWork)?storedWork:filters[0]?.key;"),
      ("captionMode='both'", "captionMode=options.captionModes?.[0]||'both'"),
      ("const modes=['both','en','ja','off'];", "const modes=options.captionModes||['both','en','ja','off'];"),
      ("{both:'英語と日本語を表示',en:'英語だけを表示',ja:'日本語だけを表示',off:'字幕を非表示'}[captionMode]", "(options.kind==='shorts'?{both:'英語と日本語を表示',en:'英語だけを表示',ja:'日本語だけを表示',off:'アプリの字幕を非表示（英語は動画内）'}:{both:'英語と日本語を表示',en:'英語だけを表示',ja:'日本語だけを表示',off:'字幕を非表示'})[captionMode]"),
      ("p.q('.mode-label').textContent={both:'英日',en:'英語',ja:'日本語',off:'字幕オフ'}[captionMode];", "p.q('.mode-label').textContent=(options.kind==='shorts'?{both:'英日',en:'英語',ja:'日本語',off:'字幕オフ'}:{both:'英日',en:'英語',ja:'日本語',off:'字幕オフ'})[captionMode];"),
      ("q('.movie-back').onclick=()=>options.home();", "q('.movie-back').setAttribute('aria-label',options.backLabel||'映画一覧に戻る');q('.movie-back').onclick=()=>options.home();"),
      ("      root.querySelector('.movie-empty-back').onclick=()=>options.home();", "      const back=root.querySelector('.movie-empty-back');back.textContent=options.backLabel||'映画一覧に戻る';back.onclick=()=>options.home();if(options.kind==='shorts')root.querySelector('.movie-empty p').textContent='このジャンルの会話はすべて100回聞き終わりました。';"),
      ("const entering=location.hash!=='#movie-player';url.hash='movie-player';", "const hash=options.playerHash||'movie-player';const entering=location.hash!=='#'+hash;url.hash=hash;"),
      ("    mounted.destroy();mounted=null;document.body.classList.remove('movie-study-open');", "    const {playerHash='movie-player',homeHash='movies'}=mounted;mounted.destroy();mounted=null;document.body.classList.remove('movie-study-open');"),
      ("if(!keepLocation&&location.hash==='#movie-player')", "if(!keepLocation&&location.hash==='#'+playerHash)"),
      ("url.hash='movies';history.replaceState", "url.hash=homeHash;history.replaceState"),
      ("    document.body.classList.add('movie-study-open');", "    if(options.kind==='shorts'){const view=container.querySelector('.movie-study');view.classList.add('real-shorts-study');view.querySelector('.work-switcher label').textContent='ジャンルを選ぶ';view.querySelector('select').setAttribute('aria-label','ジャンルを選ぶ');view.querySelector('.feed').setAttribute('aria-label','リアル英会話フィード');}\n    document.body.classList.add('movie-study-open');"),
      ("    mounted=mount(container.querySelector('.movie-study'),options);", "    mounted=mount(container.querySelector('.movie-study'),options);mounted.playerHash=options.playerHash||'movie-player';mounted.homeHash=options.homeHash||'movies';"),
      ("  function library(){", "  function library(config={}){"),
      ("    const scenes=window.MOVIE_SCENES||[];", "    const scenes=config.scenes||window.MOVIE_SCENES||[];"),
      ("    const collections=[", "    const collections=config.collections||["),
      ("      const images=key==='before'?", "      const images=config.portrait?[all[0],all[Math.floor(all.length/2)],all[all.length-1]]:key==='before'?"),
      ("onclick=\"showMovieStudy('${key}')\"", "onclick=\"${config.portrait?'showRealShorts':'showMovieStudy'}('${key}')\""),
      ("${key==='before'?'movie-filmstrip':''}", "${key==='before'||config.portrait?'movie-filmstrip':''}"),
      ('aria-labelledby="movie-library-title"', 'aria-labelledby="${config.portrait?\'real-shorts-library-title\':\'movie-library-title\'}"'),
      ('<p class="section-eyebrow">LEARN WITH MOVIES</p><h2 id="movie-library-title">映画の会話で学ぶ</h2>', '<p class="section-eyebrow">${config.portrait?\'REAL CONVERSATIONS\':\'LEARN WITH MOVIES\'}</p><h2 id="${config.portrait?\'real-shorts-library-title\':\'movie-library-title\'}">${config.portrait?\'リアルな英会話で学ぶ\':\'映画の会話で学ぶ\'}</h2>'),
      ('<p class="movie-library-intro">作品を選んで、動画と英日字幕で。最後まで聞くと1回。100回聞いた会話は一覧から自動で削除されます。</p>', '<p class="movie-library-intro">${config.portrait?\'海外の人の自然な会話を、動画と英日字幕で。\':\'作品を選んで、動画と英日字幕で。\'}最後まで聞くと1回。100回聞いた会話は一覧から自動で削除されます。</p>'),
    ]
    # The library uses config, while the player uses options.
    for old,new in changes:
        if old=='const scenes=window.MOVIE_SCENES||[];':
            if old not in text:raise ValueError('Missing player data anchor')
            text=text.replace(old,new,1)
            continue
        if old not in text:raise ValueError('Missing movie player anchor: '+old[:95])
        text=text.replace(old,new)
    return text
