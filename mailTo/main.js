initialize();

//템플릿 가져와서 목록에 뿌리는 기능
function initialize(){
	$.ajax({
		type: "POST",
		url: "https://mandrillapp.com/api/1.0/templates/list.json",
		data: { "key": "0480L-LoxL3aDxTtFGg8sQ" },
		success: function(data){
			var str = "<option></option>";
			data.forEach(function(element){
				str += "<option value='"+element.name+"'>"+element.name+"</option>";
			});
			$("#template-list").html(str);
		}
	});
}

window.onload = function() {
  var fileInput = document.getElementById('fileInput');

  fileInput.addEventListener('change', function(e) {
    var file = fileInput.files[0];
    var textType = /text.*/;

    if (file.type.match(textType)) {
      var reader = new FileReader();

      reader.onload = function(e) {
        makeData(reader.result);
      }
      reader.readAsText(file);  
    } else {
      alert("지원하지 않는 파일입니다.")
    }
  });
}

var data = 
  {
      "key": "0480L-LoxL3aDxTtFGg8sQ",
      "template_name": "",
      "template_content":[{
        "name" : "",
        "content" : ""
      }],
      "message": {
          "subject": "",
          "from_email": "noondo@opentransit.co",
          "from_name": "눈뜨면도착",
          "to": [],
          "important": false,
          "track_opens": null,
          "track_clicks": null,
          "auto_text": null,
          "auto_html": null,
          "inline_css": null,
          "url_strip_qs": null,
          "preserve_recipients": null,
          "view_content_link": null,
          "bcc_address": "",
          "tracking_domain": null,
          "signing_domain": null,
          "return_path_domain": null,
          "merge": true,
          "merge_language": "handlebars",
          "global_merge_vars": [],
          "merge_vars": []
      },
      "async": false,
      "ip_pool": "121.190.13.192"
  };

$("#template-list").change(function(){
  data.template_name = $(this).val();
});

$("#subject").change(function(){
  data.message.subject = $(this).val();
});

$("#send-test-mail").click(function(){
    sendTestMail(data);
});

$("#send-to-all").click(function(){
    sendToAll(data);
});

function makeData(inputFile){
  data.message.to = [];
  data.message.merge_vars = [];

  var dataArray = inputFile.split("\n");
  dataArray.forEach(function(element, index){
      if(index == 0) return;
      var variables = element.split(",");
      data.message.to.push({"email": variables[0], "type": "to"});
      var obj = {
          "rcpt": variables[0],
          "vars": []
      }
      variables.forEach(function(el,i){
          if(i == 0) return;
          obj.vars.push({"name" : dataArray[0].split(",")[i],"content": el});
      });
      data.message.merge_vars.push(obj);
  });
  console.log(data);
}

//test mail 보내는 기능
function sendTestMail(data){
  var copyData = jQuery.extend(true, {}, data);
	copyData.message.to = [{
                "email": $("#test-email").val(),
                "type": "to"
            }];
  copyData.message.merge_vars[0].rcpt = $("#test-email").val();
  console.log(copyData);
  console.log(data);
	$.ajax({
		type: "POST",
		url: "https://mandrillapp.com/api/1.0/messages/send-template.json",
		data: copyData,
		success: function(result){
      console.log(result);
    }
	});
}

//전체 메일 발송하는 기능
function sendToAll(data){
	if ( confirm("정말 전송하시겠습니까?") ){
    
		$.ajax({
			type: "POST",
			url: "https://mandrillapp.com/api/1.0/messages/send-template.json",
			data: data,
			success: function(result){
        console.log(result);

      },
			dataType: "json"
		});
	}
}

/* request paramaters
{
    "key": "0480L-LoxL3aDxTtFGg8sQ",
    "template_name": "example template_name",
    template_content : [],
    "message": {
        "subject": "example subject",
        "from_email": "message.from_email@example.com",
        "from_name": "Example Name",
        "to": [
            {
                "email": "recipient.email@example.com",
                "type": "to"
            }
        ],
        "important": false,
        "track_opens": null,
        "track_clicks": null,
        "auto_text": null,
        "auto_html": null,
        "inline_css": null,
        "url_strip_qs": null,
        "preserve_recipients": null,
        "view_content_link": null,
        "bcc_address": "message.bcc_address@example.com",
        "tracking_domain": null,
        "signing_domain": null,
        "return_path_domain": null,
        "merge": true,
        "merge_language": "handlebars",
        "global_merge_vars": [
            {
                "name": "merge1",
                "content": "merge1 content"
            }
        ],
        "merge_vars": [
            {
                "rcpt": "recipient.email@example.com",
                "vars": [
                    {
                        "name": "merge2",
                        "content": "merge2 content"
                    }
                ]
            }
        ],
        "tags": [
            "password-resets"
        ],
        "subaccount": "customer-123",
        "google_analytics_domains": [
            "example.com"
        ],
        "google_analytics_campaign": "message.from_email@example.com",
        "metadata": {
            "website": "www.example.com"
        },
        "recipient_metadata": [
            {
                "rcpt": "recipient.email@example.com",
                "values": {
                    "user_id": 123456
                }
            }
        ],
        "attachments": [
            {
                "type": "text/plain",
                "name": "myfile.txt",
                "content": "ZXhhbXBsZSBmaWxl"
            }
        ],
        "images": [
            {
                "type": "image/png",
                "name": "IMAGECID",
                "content": "ZXhhbXBsZSBmaWxl"
            }
        ]
    },
    "async": false,
    "ip_pool": "Main Pool",
    "send_at": "example send_at"
}
*/

