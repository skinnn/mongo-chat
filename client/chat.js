// Set port for socket
const port = 3000;

// Set default status - Disconnected
isConnected = false;

function getCurrentTime() {


    let currentTime = new Date();
    // returns the month (from 0 to 11)
    let month = currentTime.getMonth() + 1;
    // returns the day of the month (from 1 to 31)
    let day = currentTime.getDate();
    // returns the year (four digits)
    let year = currentTime.getFullYear();

    let minutes = currentTime.getMinutes();
    let hour = currentTime.getHours();
    let seconds = currentTime.getSeconds();

    let time = hour + 'h : ' + minutes + 'm : ' + seconds + 's';

    let currentDateAndTime = time;
    return currentDateAndTime;
}

function connect() {
  if(isConnected === false){
    isConnected = true;

    (function(){
      let element = function(id){
        return document.getElementById(id);
      }

      // Get Elements
      let status = element('status');
      let messages = element('messages');
      let textarea = element('textarea');
      let username = element('username');
      let clear = element('clear');

      // Clear textarea and messages before connection
      textarea.value = '';
      while (messages.firstChild) {
        messages.removeChild(messages.firstChild);
      }

      // Set default status
      let statusDefault = status.textContent;

      let setStatus = function(s){
        // Set status
        status.textContent = s;

        if(s !== statusDefault){
          let delay = setTimeout(function(){
            setStatus(statusDefault)
          }, 4000);
        }
      }

      // Connect to socket.io
      socket = io.connect(`http://127.0.0.1:${port}`);
      socket.on('hello', function(data) {
        console.log(data);
      });

      // Check for connection
      if(socket !== undefined){
        console.log('Connected to socket...');

        socket.on('hello', function(data) {
          console.log(data);
        });

        socket.on('output', function(data){
          // console.log(data);
          if(data.length){
            for(let x = 0; x < data.length; x++){
              // Build out message div
              let message = document.createElement('div');
              message.setAttribute('class', 'chat-message');

              let nameTxt = data[x].name + ': ';
              let nameNode = document.createTextNode(nameTxt);
              let nameDiv = document.createElement('span');
              nameDiv.appendChild(nameNode);
              nameDiv.className = 'nameDiv';

              let msgTxt = data[x].message;
              let msgNode = document.createTextNode(msgTxt);
              let msgDiv = document.createElement('span')
              msgDiv.appendChild(msgNode);
              msgDiv.className = 'msgTextDiv';

              let timeTxt = data[x].time;
              let timeNode = document.createTextNode(timeTxt);
              let timeDiv = document.createElement('div');
              timeDiv.appendChild(timeNode);
              timeDiv.className = 'timeDiv';

              message.appendChild(nameDiv);
              message.appendChild(timeDiv);
              message.appendChild(msgDiv);

              messages.appendChild(message);
              messages.insertBefore(message, messages.firstChild);
            }
          }
        });

        // Get status from server
        socket.on('status', function(data){
          // Get messages status
          setStatus((typeof data === 'object')? data.message : data);

          // If status is clear then clear text
          if(data.clear){
            textarea.value = '';
          }
        });

        // Handle Input
        textarea.addEventListener('keydown', function(event){
          if(event.which === 13 && event.shiftKey == false){
            // Emit to server input
            socket.emit('input', {
              name: username.value,
              message: textarea.value,
              time: getCurrentTime().toString()
            });

            event.preventDefault();
          }
        })

        // Handle Chat Clear
        // clearBtn.addEventListener('click', function(){
        //   socket.emit('clear');
        // });

        // Clear Message
        socket.on('cleared', function(){
          messages.textContent = '';
        });
      }

      // Button status - Connected
      let connectBtn = element('connectBtn');
      connectBtn.textContent = 'Disconnect';
      connectBtn.className = 'btn btn-light';

      // Status text - Connected
      let isConnectedStatus = element('isConnectedStatus');
      isConnectedStatus.textContent = 'Connected';
      isConnectedStatus.style.color = 'green';

      })();

    } else if(isConnected === true) {
      isConnected = false;

      // Clear messages
      while (messages.firstChild) {
        messages.removeChild(messages.firstChild);
      }

      // Disconnect from socket - not working
      socket.emit('disconnect');
      socket = null;

      // Reload location to kill socket
      location.reload();

      // Wipe messages window
      let textarea = document.getElementById('textarea');
      textarea.value = '';

      // Button status - Disconnected
      connectBtn.textContent = 'Connect';
      connectBtn.className = 'btn btn-success';

      // Status text - Disconnected
      isConnectedStatus.textContent = 'Disconnected';
      isConnectedStatus.style.color = 'red';
    }
  };
