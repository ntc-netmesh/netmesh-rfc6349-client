eel.expose(printreverse);
function printreverse(result){
    disableMainForm(false);
    
    testFinishedAt = moment().format('YYYY-MM-DD HH:mm:ss');
    clearInterval(measurementTimer);

    //document.getElementById("local_result").value += result + "\n";

    localResultId = '#tblRemoteResult tbody';
    $(localResultId).empty();

    $('#results-info').show();
    $('#error-info').hide();

    if (result) {
        if ("MTU" in result){
            $(localResultId).append(`<tr><td>${ 'MTU' }</td><td>${ result["MTU"] }${ ' Bytes' }</td></tr>`);
        }
        if ("RTT" in result){
            $(localResultId).append(`<tr><td>${ 'RTT' }</td><td>${ result["RTT"] }${ ' ms' }</td></tr>`);
        }
        // if ("BB" in result){
        //     $(localResultId).append(`<tr><td>${ 'BB' }</td><td>${ result["BB"] }${ ' Mbps' }</td></tr>`);
        // }
        // if ("BDP" in result){
        //     $(localResultId).append(`<tr><td>${ 'BDP' }</td><td>${ result["BDP"] }${ '' }</td></tr>`);
        // }
        if ("RWND" in result){
            $(localResultId).append(`<tr><td>${ 'TCP RWND' }</td><td>${ result["ACTUAL_RWND"] }${ ' Bytes' }</td></tr>`);
        }
        if ("THPT_AVG" in result){
            $(localResultId).append(`<tr><td>${ 'Average TCP Throughput' }</td><td>${ result["THPT_AVG"] }${ ' Mbps' }</td></tr>`);
        }
        if ("ACTUAL_IDEAL" in result){
            $(localResultId).append(`<tr><td>${ 'Ideal TCP Throughput' }</td><td>${ result["ACTUAL_IDEAL"] }${ ' Mbps' }</td></tr>`);
        }
        if ("TRANSFER_AVG" in result){
            $(localResultId).append(`<tr><td>${ 'Average Transfer Time' }</td><td>${ result["TRANSFER_AVG"] }${ ' s' }</td></tr>`);
        }
        if ("TRANSFER_IDEAL" in result){
            $(localResultId).append(`<tr><td>${ 'Ideal Transfer Time' }</td><td>${ result["TRANSFER_IDEAL"] }${ ' s' }</td></tr>`);
        }
        if ("TCP_TTR" in result){
            $(localResultId).append(`<tr><td>${ 'TCP TTR' }</td><td>${ result["TCP_TTR"] }${ '' }</td></tr>`);
        }
        if ("TRANS_BYTES" in result){
            $(localResultId).append(`<tr><td>${ 'Transmitted Bytes' }</td><td>${ result["TRANS_BYTES"] }${ ' Bytes' }</td></tr>`);
        }
        if ("RETX_BYTES" in result){
            $(localResultId).append(`<tr><td>${ 'Reransmitted Bytes' }</td><td>${ result["RETX_BYTES"] }${ ' Bytes' }</td></tr>`);
        }
        if ("TCP_EFF" in result){
            $(localResultId).append(`<tr><td>${ 'TCP Efficiency' }</td><td>${ result["TCP_EFF"] }${ '' }</td></tr>`);
        }
        if ("AVE_RTT" in result){
            $(localResultId).append(`<tr><td>${ 'Average RTT' }</td><td>${ result["AVE_RTT"] }${ ' ms' }</td></tr>`);
        }
        if ("BUF_DELAY" in result){
            $(localResultId).append(`<tr><td>${ 'Buffer Delay' }</td><td>${ result["BUF_DELAY"] }${ '%' }</td></tr>`);
        }
    } else {
        $(localResultId).append(`<tr><td><span class="text-muted">${ 'No measured results' }<span></td></tr>`);
    }

    // if (!result) {
    //     alert("No measured results");
    //     return;
    // }

    // if ("MTU" in result){
    //     document.getElementById("remote_result").innerHTML += "MTU: " + result["MTU"] + "Bytes <br>";
    // }
    // if ("RTT" in result){
    //     document.getElementById("remote_result").innerHTML += "RTT: " + result["RTT"] + "ms<br>";
    // }
    // if ("BB" in result){
    //     document.getElementById("remote_result").innerHTML += "BB: " + result["BB"] + "Mbps<br>";
    // }
    // if ("BDP" in result){
    //     document.getElementById("remote_result").innerHTML += "BDP: " + result["BDP"] + "<br>";
    // }
    // if ("RWND" in result){
    //     document.getElementById("remote_result").innerHTML += "TCP RWND: " + result["RWND"] + "<br>";
    // }
    // if ("THPT_AVG" in result){
    //     document.getElementById("remote_result").innerHTML += "Average TCP Throughput: " + result["THPT_AVG"] + "Mbps<br>";
    // }
    // if ("THPT_IDEAL" in result){
    //     document.getElementById("remote_result").innerHTML += "Ideal TCP Throughput: " + result["THPT_IDEAL"] + "Mbps<br>";
    // }
    // if ("TRANSFER_AVG" in result){
    //     document.getElementById("remote_result").innerHTML += "Average Transfer Time: " + result["TRANSFER_AVG"] + "s<br>";
    // }
    // if ("TRANSFER_IDEAL" in result){
    //     document.getElementById("remote_result").innerHTML += "Ideal Transfer Time: " + result["TRANSFER_IDEAL"] + "s<br>";
    // }
    // if ("TCP_TTR" in result){
    //     document.getElementById("remote_result").innerHTML += "TCP TTR: " + result["TCP_TTR"] + "<br>";
    // }
    // if ("TRANS_BYTES" in result){
    //     document.getElementById("remote_result").innerHTML += "Transmitted Bytes: " + result["TRANS_BYTES"] + "Bytes<br>";
    // }
    // if ("RETX_BYTES" in result){
    //     document.getElementById("remote_result").innerHTML += "Reransmitted Bytes: " + result["RETX_BYTES"] + "Bytes<br>";
    // }
    // if ("TCP_EFF" in result){
    //     document.getElementById("remote_result").innerHTML += "TCP Efficiency: " + result["TCP_EFF"] + "<br>";
    // }
    // if ("AVE_RTT" in result){
    //     document.getElementById("remote_result").innerHTML += "Average RTT: " + result["AVE_RTT"] + "ms<br>";
    // }
    // if ("BUF_DELAY" in result){
    //     document.getElementById("remote_result").innerHTML += "Buffer Delay: " + result["BUF_DELAY"] + "%<br>";
    // }
}
