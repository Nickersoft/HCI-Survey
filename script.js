/* * * * * * * * * * * * * *
 *                         *
 *        Variables        *
 *                         *
 * * * * * * * * * * * * * */

var counter;                //Timer current time
var timer;                  //Timer interval object
var results = [];           //Results of each question
var current_index = 0;      //The current passage index
var message_index = 0;      //The current intro screen page index

var user_info = [];         //Serialied user information

/* * * * * * * * * * * * * *
 *                         *
 *     Window Functions    *
 *                         *
 * * * * * * * * * * * * * */

/*
 *      Name: progress_page()
 *   Purpose: Progress the page of the introduction screen
 * Arguments: None
 *   Returns: Void
 */
var progress_page = function() {
    var next_page = $("#message #page" + (message_index + 1));
    if(validate(message_index)) {
        if(next_page.length) {
            $("#message .page").hide();
            $("#message .error").eq(0).hide();
            next_page.show();
            if(message_index==2) {
                user_info = {};
                user_info["user"] = $("#ui_form").serializeArray();
                results.push(user_info);
            }
            message_index++;
        } else {
            user_info["user"].push({ "name" : "sig", "value" : $("#sig").val()});
            $("#message").hide();
            $("#overlay").hide();
            next_part();
        }
    } else {
        $("#message .error").eq(0).show();
    }
};

/*
 *      Name: validate()
 *   Purpose: Validates each screen of the intro window's input
 * Arguments: 
 *      - Integer index : The index of the screen to validate
 *   Returns: Boolean
 */
var validate   = function(index) {
    var has_name   = ($("#name").val().length != 0);
    var has_email  = validator.isEmail($("#eaddr").val());
    var has_gender = ($("#sex input[name=sex]:checked").length != 0);
    var has_sig    = ($("#sig").val().length != 0);
    var has_agreed = ($("#agree").is(":checked"));

    switch(index) {
        case 2:
            return (has_agreed&&has_gender&&has_email&&has_name);
            break; 
        case 3:
            return has_sig;
            break;
        default:
            return true;
            break;
    }
};

/* * * * * * * * * * * * * *
 *                         *
 *    Passage Functions    *
 *                         *
 * * * * * * * * * * * * * */

/*
 *      Name: next_part()
 *   Purpose: Move to the next passage
 * Arguments: None
 *   Returns: Void
 */
var next_part = function() {
    current_index++;
    
    if(current_index<=6) {
        $(".part").hide();
        $("#part" + current_index).show();
        $("#read-button").show();
    } else {
        $(".part").hide();
        $("#read-button").hide();
        $("#overlay").show();
        $("#final").show();
    }
};

/*
 *      Name: start_timer
 *   Purpose: Starts the timer
 * Arguments: None
 *   Returns: Void
 */
var start_timer = function() {
    counter = 0;
    timer = setInterval(function() {
        counter += 1;
    }, 1);
    $("#read-button").html("Stop Reading");
};

/*
 *      Name: stop_timer()
 *   Purpose: Stops the timer
 * Arguments: None
 *   Returns: Void
 */
var stop_timer = function() {
    clearInterval(timer);
    $("#count").html("00:00:00");
    $("#read-button").html("Start Reading");
    show_questions(counter);
};

/*
 *      Name: show_questions()
 *   Purpose: Shows the questions corresponding to the current passage
 * Arguments: None
 *   Returns: Void
 */
var show_questions = function(time) {
    $("#overlay").show();
    var cur_q = $("#question" + current_index);
    cur_q.show();
    cur_q.find("#time").val(counter);
}

$(document).ready(function() {
    stop_timer(); 
    progress_page();
    $(".error").hide();
    $(".part").hide();
    $(".qbox").hide();
    
    $("#read-button").click(function() {
        if($("#read-button").hasClass("normal")) {
            $("#read-button").removeClass("normal").addClass("stop");   
            start_timer();
        } else {
            $("#read-button").removeClass("stop").addClass("normal");   
            stop_timer();
        }
    });

    $("#read-button").hide();
    
    var qbox_index = 1;
    $(".qbox").each(function() {
        $(this).find("button").eq(0).click(function() {
            var parent = $(this.parentNode);
            var radios = parent.find("input[type=radio]");
            var pass   = true; 
            radios.each(function() {
                var radio_name = $(this).attr("name");
                var is_checked = (parent.find("input[name=" + radio_name + "]:checked").length != 0);
                pass = pass && is_checked;
            });
            if(pass) {
                var new_element = {};
                new_element[results.length] = parent.find("form").eq(0).serializeArray();
                results.push(new_element);
                if(parent.attr("id")=="final") {
                    $.ajax({
                        type: 'GET',
                        url: './submit',
                        data: {
                            data : JSON.stringify(results)
                        },
                        complete: function(data) {
                            $("#thanks").show();
                        },
                        contentType: "application/json",
                        dataType: 'json'
                    });
                } else {
                    $(this.parentNode).hide();   
                    $("#overlay").hide();
                    next_part();   
                }
            } else {
                parent.find(".error").eq(0).show();
            }
        });
    });

    $("#message #continue").click(function() {
        progress_page();
    });
    
    $("#thanks").hide();
});