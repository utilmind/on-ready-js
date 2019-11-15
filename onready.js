/* (c) 2018 Oleksii Kuznietsov for Favorites of Success, LLC (www.favor.com.ua)

   AK 21.08.2018. ���� ������ ������������ ������������� ��� ������ � ������������.
   �� �������, ������������ ������ ���� ��� ����� �������� � ����� �������.

   ������:
     ��������������� ������������� ������-�� JS-���� ��� ������ ������� �����������.
     ������, ������� ����������� ������������ ����� �������������.
     ��� ������������� ������������� ����-���� � ������ ������ � �� ����������� �� ��������� ����������.

     � �����, � ���-������� (� �������� "document"), ��� ��������, ���� 3 ���������: loading, interactive � complete.

     1. �������, �� ��������� �� ���������������� ���������� �� ����� loading...
     2. ���� ������ ���������� � ��������� ������������� � ���� interactive, ����������� �������� ����� �����������
        � ������� document.addEventListener("DOMContentLoaded", function(){...}) ��� $(document).onReady() � jQuery.
     3. ���� �� �� ������ ������� ������ � ������ 2 ����� � ������ �� ���������� �������� ���� �������� ��������.
        �� ������� window.addEventListener("load",function(){...}) ��� $(window).onLoad().

     ����������, jQuery �� ������������ �� �����. �� ��������� jQuery �����������.

     ����������� ���������� ������ ����������� ������������� (����� doInit � jqWait) ���� ������� ��
     https://www.favor.com.ua/ru/blogs/30122.html. ��� �� https://jsfiddle.net/utilmind/wyrb5j6e/.

     ������, �� ����������� � ���������. doInit()/jqWait() ����� ���� ������� ��� ����� �������� ��������, �� �����
     interactive, ��� ��� ���� �� ����� complete. �������, ��� ������ �������� �� document."DOMContentLoaded" �����
     ���������� �������� � �� window."load" ����� ��������. ������� �� ��������, ������ �� ���������.

     ����� ������������ ���, ����� �� ������� �� ������� ����������� �������� ��������� ���������.


   UPD 15.11.2019: Don't repeat my mistake, do not try to trigger onLoad event dynamically in uAJAX Navigator after the page loaded.
     You still have to wait until the sub-resource will be loaded and only then perform some required initializaton.

     So just hook onLoad event of the subresource (eg <script>), and be happy.
 */

/* wReady -- ����������� ������� � ��������� ������� ����� ��������� ���������.
   �� �������� ���� � ������������� � document."DOMContentLoaded".
   ����� �������� ���� � � window."load".
   ����� �������� ���� ��������� � �� � ���� ��� �� �������������.

   ���������:
     f -- �����, ������� ������ �����������.
          ��� ���� ���� ����� ������ ���������� 1 (TRUE) ���� ������������� �� ������� � ����� ������ ���� �������� �� ���������� �������.
     waitComplete -- (�� ������������)
 */
wReady = function(func, waitComplete) { // �������� �� �������� ���� ����. ��� ������������ ����������. (���������� ��������� ������ ���� ��� ������� ��� ��������.)
  var r = document.readyState;
  console.log("wReady: readyState is " + r);

  if (!waitComplete && r === "loading") {
    console.log("wReady: hooking onReady");
    document.addEventListener("DOMContentLoaded", function() {
      if (func(2/*ready || readyState == "interactive" */)) {
        console.log('wReady: wait till next action (complete load)')
        wReady(func); // wait till next action (complete load)
      }
    })

  }else if (r !== "complete") { // == interactive (some sub-resources still loading)
    console.log("wReady: hooking onLoad");
    window.addEventListener("load", function(){ func(3/*loaded || readyState == "complete" */); })

  }else {
    console.log("wReady: nothing to hook. Just executing.");
    func(3/*loaded || readyState =="complete" */); // execute imediately, since everything already fully loaded.
  }
}

/* doInit -- ��������� �����-�� �����, ���������� ���������� f.
   ���������:
     f -- �����, ������� ������ �����������.
          ����� ������ ���������� 1 (TRUE) ���� ������������� �� ������� � ����� ������ ���� �������� �� ���������� �������.
          ������ ����� ����� ��������� � ���������� Integer-����, f(int). ��������� ��������:
            1 -- �������� ���������� ����� ������ doInit(). ���������� �� �������� ��������� ���������.
                 ��� ������� ����������� ��� document.readyState == "loading", �� �� �����������.
                 ��� ������ ������������� ������ ������ ��������� ���������, ����� ��������� document.readyState ������ �������.
            2 -- �������� �� ���������� ���������, ����� ���� DOM-������� ��������, �� �� ���������� �������� ������� ��������.
                 (document.readyState == "interactive")
            3 -- �������� ����� �� ������ �� ����� ������, ��� ������� �������, �����, �������� � ������ �� ���������.
                 (document.readyState == "complete")
     wait -- (�� ������������) ����� �� ��� ��������� �� ������� ���� ������ �������� ��������.
             ��������� ��������:
               1 -- ���� HTML �������� (readyState == "interactive" ��� ������) � ��������� ����������.
                    �� ���� ����� �� ����� "loading" ��� ����� ��������� �������. ready ��� load.
                          (�� ����, � ��������, ��� �� ��, ��� �������� ������� ������ � ���������� defer.)
                          ��� ������ �������� wait, ���������������� doInit �������� �� ���: doInit=function(f,w){(w||f(1))&&wReady(f,w>1)}
               2 -- ��� ������ load, ������ �������� �����.
 */
doInit = function(func, wait) {
  console.trace('doInit '+ wait + ', readyState: ' + document.readyState)
  if (wait > 1 || // ������ 1 ��� �������� � ������.
     (wait && document.readyState === "loading") || // ���� 1 �� ��� ���� �� ����� loading.
     func(1/*imediate start, no matter what stage*/)) { // ����� ��������� ����� ��� ��������.
      // BTW, f() returns 1 (TRUE) if initialization is not yet successful. So we must wait in wReady().
    wReady(func, wait > 1); // ������� f ������. ��� �� ������� ����� �� ���������� �������. � ����� ����� ������� � ���������� ����������.
  }
}
//doInit=function(f,w){(w>1||(w&&document.readyState=="loading")||f(1))&&wReady(f,w>1)}

/* jqWait -- ��� ������ ������� jQuery + ������� �����-�� �����/������, ��������� ������ (name).
             �����/���� �������� jQuery � ���� � ���� ��������� ����� ������ �� ����� "name", ��:
               1. ��������� ������������� �����, �������� �� �����.
               2. �� ���������� �������������, ��������� ����� �������� ���������� (f).
   ���������:
     name			-- ��� �����, ������� ������ ��������� ��� ������� jQuery � ����� ����� � ����� ������.
     f				-- ��, ��� ������ ��������� ����� ������ ����� � ������ name.
          ������ ����� ����� ��������� � ���������� Integer-����, f(int). ��������� ��������:
            1 -- �������� ���������� ����� ������ doInit(). ���������� �� �������� ��������� ���������.
                 ��� ������� ����������� ��� document.readyState == "loading", �� �� �����������.
                 ��� ������ ������������� ������ ������ ��������� ���������, ����� ��������� document.readyState ������ �������.
            2 -- �������� �� ���������� ���������, ����� ���� DOM-������� ��������, �� �� ���������� �������� ������� ��������.
                 (document.readyState == "interactive")
            3 -- �������� ����� �� ������ �� ����� ������, ��� ������� �������, �����, �������� � ������ �� ���������.
                 (document.readyState == "complete")
     alwaysRunFuncOnLoad	-- ���� ���� ���-�� �� ������������������ � 3 �������, �� ����� ��������� ����� f() �� ����� ������ �������� ��������.
                                   ...��� ������, � ������� � ������������� ������� ���������. �� ��� shining-������� (������������ �����) ��� ������,
                                   �� �� �� �������� ��� ������ �������. �������, ���� ���� �� ��������� jq-������� � ����� ��������, �� �����
                                   ���������� ������, ����� ���� ��� ����� �� ������.
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
