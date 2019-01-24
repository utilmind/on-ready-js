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
 */

/* wReady -- ����������� ������� � ��������� ������� ����� ��������� ���������.
   �� �������� ���� � ������������� � document."DOMContentLoaded".
   ����� �������� ���� � � window."load".
   ����� �������� ���� ��������� � �� � ���� ��� �� �������������.

   ���������:
     f -- �����, ������� ������ �����������.
          ��� ���� ���� ����� ������ ���������� 1 (TRUE) ���� ������������� �� ������� � ����� ������ ���� �������� �� ���������� �������.
     wait_complete -- (�� ������������)
 */
wReady=function(f, wait_complete) { // �������� �� �������� ���� ����. ��� ������������ ����������. (���������� ��������� ������ ���� ��� ������� ��� ��������.)
  var r = document.readyState;
  console.log("wReady: readyState is " + r);
  if (!wait_complete && r == "loading") {
    console.log("wReady: hooking onReady");
    document.addEventListener("DOMContentLoaded", function(){
      if (f(2/*ready || readyState == "interactive" */)) {
        console.log('wReady: wait till next action (complete load)')
        wReady(f); // wait till next action (complete load)
      }
    })
  }else if (r != "complete") { // == interactive
    console.log("wReady: hooking onLoad");
    window.addEventListener("load", function(){ f(3/*loaded || readyState == "complete" */); })
  }else {
    console.log("wReady: nothing to hook. Just executing.");
    f(3/*loaded || readyState =="complete" */); // execute imediately, since everything already fully loaded.
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
doInit=function(f, wait) {
  console.trace('doInit '+wait)
  if (wait > 1 || // ������ 1 ��� �������� � ������.
     (wait && document.readyState == "loading") || // ���� 1 �� ��� ���� �� ����� loading.
     f(1/*imediate start, no matter what stage*/)) // ����� ��������� ����� ��� ��������.
      // BTW, f() returns 1 (TRUE) if initialization is not yet successful. So we must wait in wReady().
    wReady(f, wait>1) // ������� f ������. ��� �� ������� ����� �� ���������� �������. � ����� ����� ������� � ���������� ����������.
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
     always_run_f_onload	-- ���� ���� ���-�� �� ������������������ � 3 �������, �� ����� ��������� ����� f() �� ����� ������ �������� ��������.
                                   ...��� ������, � ������� � ������������� ������� ���������. �� ��� shining-������� (������������ �����) ��� ������,
                                   �� �� �� �������� ��� ������ �������. �������, ���� ���� �� ��������� jq-������� � ����� ��������, �� �����
                                   ���������� ������, ����� ���� ��� ����� �� ������.
 */
jqWait=function(name, f, always_run_f_onload){
  console.log('jqWaiting for '+name)
  doInit(function(pass){
    if (typeof $!="undefined" && typeof window[name]=="function") {
      console.log('jqWaited '+name)
      window[name]()
    }else if ((pass < 3 || !always_run_f_onload)) {
      // -- start logging
      var act = (pass == 1 ? 'imediately' : (pass == 2 ? 'document ready' : 'fully loaded'))
      var log = ' no shit "'+name+'" (pass #'+pass+', '+act+'). Typeof: '+(typeof window[name])
      if (pass == 3)
        log = 'Still has'+log+'. (No shit at all? Misspelled or just an old script in cache?)'
      else
        log = 'Has'+log
      console.log(log)
      // -- end logging
      return 1
    }else
      console.log('jqWait: still no '+name+', but we have to go on')
    if (f) f()
  })
}


// MINIFIED CODE
//wReady=function(f,w){var r=document.readyState;w||r!="loading"?r!="complete"?window.addEventListener("load",function(){f(3)}):f(3):document.addEventListener("DOMContentLoaded",function(){f(2)&&wReady(f)})}
//doInit=function(f,w){(w>1||(w&&document.readyState=="loading")||f(1))&&wReady(f,w>1)}
//jqWait=function(n,f,a){doInit(function(p){if("undefined"!=typeof $&&"function"==typeof window[n])window[n]();else if(p<3||!a)return 1;f&&f()})}
