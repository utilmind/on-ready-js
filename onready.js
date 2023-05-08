/* (c) 2018 Oleksii Kuznietsov for Favorites of Success, LLC (www.favor.com.ua)

   AK 21.08.2018. Этот скрипт используется исключительно для дебага и комментариев.
   На рабочих, продуктивных сайтах этот код даётся инлайном в шапке страниц.

   Задача:
     Гарантированная инициализация какого-то JS-кода при первой удобной возможности.
     Причём, удобная возможность определяется самим инициализации.
     При невозможности инициализации чего-либо в данный момент — всё переносится на следующий подходящий.

     В целом, у веб-страниц (у объектов "document"), как известно, есть 3 состояния: loading, interactive и complete.

     1. Конечно, мы стараемся всё инициализировать немедленно на этапе loading...
     2. Если первое невозможно — переносим инициализацию в этап interactive, наступление которого можно перехватить
        с помощью document.addEventListener("DOMContentLoaded", function(){...}) или $(document).onReady() с jQuery.
     3. Если мы не смогли сделать работу в первые 2 этапа — делаем по завершению загрузки всех объектов страницы.
        По сигналу window.addEventListener("load",function(){...}) или $(window).onLoad().

     Разумеется, jQuery мы использовать не будем. Мы загружаем jQuery ассинхронно.

     Превосходно работающий скрипт асинхронной инициализации (функи doInit и jqWait) были описаны на
     https://www.favor.com.ua/ru/blogs/30122.html. Или на https://jsfiddle.net/utilmind/wyrb5j6e/.

     Однако, мы столкнулись с проблемой. doInit()/jqWait() могут быть вызваны уже после загрузки страницы, на этапе
     interactive, или ещё хуже на этапе complete. Конечно, нет смысла вешаться на document."DOMContentLoaded" после
     завершения загрузки и на window."load" после загрузки. Событие не случится, ничего не произойдёт.

     Здесь переписываем код, чтобы он вешался на события современные текущему состоянию документа.


   UPD 15.11.2019: Don't repeat my mistake, do not try to trigger onLoad event dynamically in uAJAX Navigator after the page loaded.
     You still have to wait until the sub-resource will be loaded and only then perform some required initializaton.

     So just hook onLoad event of the subresource (eg <script>), and be happy.
 */

/* wReady -- привязывает функцию к ближашему событию смены состояния документа.
   До загрузки кода — привязывается к document."DOMContentLoaded".
   После загрузки кода — к window."load".
   После загрузки всех элементов — ни к чему уже не привязываемся.

   Параметры:
     f -- функа, которая должна выполниться.
          При этом сама функа должна возвращать 1 (TRUE) если инициализация не удалась И функа должна быть отложена до следующего события.
     waitComplete -- (не обязательный)
 */
wReady = function(func, waitComplete) { // вешаемся на ожидание чего либо. Без немедленного выполнения. (Немедленно выполняем только если все события уже миновали.)
  var readyState = document.readyState;
  console.log("wReady: readyState is " + readyState);

  if (!waitComplete && ("loading" === readyState)) {
    console.log("wReady: hooking onReady");
    document.addEventListener("DOMContentLoaded", function() {
      if (func(2/*ready || readyState == "interactive" */)) {
        console.log("wReady: wait till next action (complete load)");
        wReady(func); // wait till next action (complete load)
      }
    });

  }else if ("complete" !== readyState) { // == interactive (some sub-resources still loading)
    console.log("wReady: hooking onLoad");
    window.addEventListener("load", function(){ func(3/*loaded || readyState == "complete" */); });

  }else if ("number" == typeof document.uLateLoad) { // custom property, custom event. See common.js, fillHtml(). Alternative is "undefined" != typeof document.uLateLoad.
    console.log("wReady: hooking uLateLoad");
    document.addEventListener("uLateLoad", function handleLateLoad() {
      document.removeEventListener("uLateLoad", handleLateLoad); // remove itself
      console.log("uLateLoad tiggered!");
      func(3);
    });

  }else {
    console.log("wReady: nothing to hook. Just executing.");
    func(3/*loaded || readyState =="complete" */); // execute imediately, since everything already fully loaded.
  }
}

/* doInit -- выполняет какую-то функу, переданную параметром f.
   Параметры:
     f -- функа, которая должна выполниться.
          Функа должна возвращать 1 (TRUE) если инициализация не удалась И функа должна быть отложена до следующего события.
          Причём функа будет выполнена с параметром Integer-типа, f(int). Возможные значения:
            1 -- запущено немедленно после вызова doInit(). Независимо от текущего состояния документа.
                 Как правило запускается при document.readyState == "loading", но не обязательно.
                 При острой необходимости узнать точное состояние документа, лучше проверять document.readyState внутри функции.
            2 -- запущено по готовности документа, когда весь DOM-контент построен, но до завершения загрузки внешних скриптов.
                 (document.readyState == "interactive")
            3 -- запущено когда всё вообще на своих местах, все внешние скрипты, стили, картинки и вообще всё загружено.
                 (document.readyState == "complete")
     wait -- (не обязательный) стоит ли нам подождать по меньшей мере полной загрузки страницы.
             Возможные значения:
               1 -- Если HTML загружен (readyState == "interactive" или дальше) — запускаем немедленно.
                    Но если вызов на этапе "loading" ждём любое следующее событие. ready или load.
                          (То есть, в принципе, это то же, что повесить внешний скрипт с директивой defer.)
                          Без такого сложного wait, минифицированный doInit выглядел бы так: doInit=function(f,w){(w||f(1))&&wReady(f,w>1)}
               2 -- ждём именно load, полную загрузку всего. Всех внешних ресурсов, всех скриптов и картинок.
 */
doInit = function(func, wait) {
  console.trace('doInit '+ wait + ', readyState: ' + document.readyState)
  if (wait > 1 || // больше 1 ждём полюбому и всегда.
     (wait && document.readyState === "loading") || // если 1 то ждём лишь на этапе loading.
     func(1/*imediate start, no matter what stage*/)) { // иначе запускаем функу без ожидания.
      // BTW, f() returns 1 (TRUE) if initialization is not yet successful. So we must wait in wReady().
    wReady(func, wait > 1); // передаём f дальше. Там мы повесим функу на правильное событие. И функа будет вызвана с правильным параметром.
  }
}
//doInit=function(f,w){(w>1||(w&&document.readyState=="loading")||f(1))&&wReady(f,w>1)}

/* jqWait -- ждёт именно наличия jQuery + наличия какой-то функи/класса, заданного именем (name).
             Когда/если загружен jQuery И есть в поле видимости некий объект по имени "name", то:
               1. выполняет инициализацию функи, заданной по имени.
               2. по завершению инициализации, выполняет функу заданную параметром (f).
   Параметры:
     name			-- имя функи, которая должна вызваться при наличии jQuery и самой функи с таким именем.
     f				-- то, что должно произойти после вызова функи с именем name.
          Причём функа будет выполнена с параметром Integer-типа, f(int). Возможные значения:
            1 -- запущено немедленно после вызова doInit(). Независимо от текущего состояния документа.
                 Как правило запускается при document.readyState == "loading", но не обязательно.
                 При острой необходимости узнать точное состояние документа, лучше проверять document.readyState внутри функции.
            2 -- запущено по готовности документа, когда весь DOM-контент построен, но до завершения загрузки внешних скриптов.
                 (document.readyState == "interactive")
            3 -- запущено когда всё вообще на своих местах, все внешние скрипты, стили, картинки и вообще всё загружено.
                 (document.readyState == "complete")
     alwaysRunFuncOnLoad	-- даже если что-то не инициализировалось в 3 попытки, всё равно запускать функу f() на этапе полной загрузки страницы.
                                   ...Так бывает, к примеру в инициализации баннера Фаворитов. Мы ждём shining-эффекта (пробегающего блика) для медали,
                                   но он не критичен для показа баннера. Поэтому, даже если не дождались jq-плагина с таким эффектом, всё равно
                                   показываем баннер, пусть даже без блика на медали.
 */
jqWait = function(name, func, alwaysRunFuncOnLoad) {
  console.log('jqWaiting for '+name);

  doInit(function(pass) {
    if (typeof $ != "undefined" && typeof window[name] == "function") {
      console.log('jqWaited '+name);
      window[name]();

    }else if ((pass < 3 || !alwaysRunFuncOnLoad)) {
      // -- start logging
      var act = (pass == 1 ? 'imediately' : (pass == 2 ? 'document ready' : 'fully loaded')),
          log = ' no shit "'+name+'" (pass #'+pass+', '+act+'). Typeof: '+(typeof window[name]);

      console.log(pass == 3 ?
        'Still has' + log + '. (No shit at all? Misspelled or just an old script in cache?)' :
        'Has' + log);

      // -- end logging
      return 1;
    }else
      console.log('jqWait: still no '+name+', but we have to go on');

    if (func) func();
  })
}


// MINIFIED CODE
//wReady=function(f,w){var r=document.readyState;w||r!="loading"?r!="complete"?window.addEventListener("load",function(){f(3)}):f(3):document.addEventListener("DOMContentLoaded",function(){f(2)&&wReady(f)})}
//doInit=function(f,w){(w>1||(w&&document.readyState=="loading")||f(1))&&wReady(f,w>1)}
//jqWait=function(n,f,a){doInit(function(p){if("undefined"!=typeof $&&"function"==typeof window[n])window[n]();else if(p<3||!a)return 1;f&&f()})}
