import React from 'react';
import { useLocation } from 'react-router-dom';
import DOMPurify from "dompurify";
const Results = () => {
    const location = useLocation();
    const myHTML = `<div class="cadre">
    <div class="onglet">
        <img src="style/cible.png" />
        <p><span>basicsimulation</span></p>
    </div>
    <div class="content">
        <div class="sous-menu">
            <div class="item ouvert"><a href="index.html">GLOBAL</a></div>
            <div class="item "><a id="details_link" href="#">DETAILS</a></div>
            <script type="text/javascript">
              var timestamp = 1656017263276;
              var runStartHumanDate = moment(timestamp).format("YYYY-MM-DD HH:mm:ss Z");
              document.writeln("<p class='sim_desc' title='"+ runStartHumanDate +", duration : 61 seconds' data-content=''>");
              document.writeln("<b>" + runStartHumanDate + ", duration : 61 seconds </b>");
              document.writeln("</p>");
            </script>
        </div>
        <div class="content-in">
            <h1><span>> </span>Global Information</h1>
            <div class="article">
                
<div class="schema polar">
  <div id="container_number_of_requests"></div>
</div>

<div class="schema demi">
  <div id="container_indicators" class="demi"></div>
</div>

            <div class="statistics extensible-geant collapsed">
                <div class="title">
                    <div class="right">
                        <span class="expand-all-button">Expand all groups</span> | <span class="collapse-all-button">Collapse all groups</span>
                    </div>
                    <div id="statistics_title" class="title_collapsed">STATISTICS <span>(Click here to show more)</span></div>
                </div>
                <table id="container_statistics_head" class="statistics-in extensible-geant">
                    <thead>
                        <tr>
                            <th rowspan="2" id="col-1" class="header sortable sorted-up"><span>Requests</span></th>
                            <th colspan="5" class="header"><span class="executions">Executions</span></th>
                            <th colspan="8" class="header"><span class="response-time">Response Time (ms)</span></th>
                        </tr>
                        <tr>
                            <th id="col-2" class="header sortable"><span>Total</span></th>
                            <th id="col-3" class="header sortable"><span>OK</span></th>
                            <th id="col-4" class="header sortable"><span>KO</span></th>
                            <th id="col-5" class="header sortable"><span>% KO</span></th>
                            <th id="col-6" class="header sortable"><span><abbr title="Count of events per second">Cnt/s</abbr></span></th>
                            <th id="col-7" class="header sortable"><span>Min</span></th>
<th id="col-8" class="header sortable"><span>50th pct</span></th>
<th id="col-9" class="header sortable"><span>75th pct</span></th>
<th id="col-10" class="header sortable"><span>95th pct</span></th>
<th id="col-11" class="header sortable"><span>99th pct</span></th>
<th id="col-12" class="header sortable"><span>Max</span></th>
<th id="col-13" class="header sortable"><span>Mean</span></th>
<th id="col-14" class="header sortable"><span>Std Dev</span></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
                <div class="scrollable">
                    <table id="container_statistics_body" class="statistics-in extensible-geant">
                        <tbody></tbody>
                    </table>
                </div>
            </div>

<div class="schema geant">
  <a name="active_users"></a>
  <div id="container_active_users" class="geant"></div>
</div>

<div class="schema geant">
  <div id="container_distrib" class="geant"></div>
</div>

<div class="schema geant">
  <div id="container" class="geant"></div>
</div>

<div class="schema geant">
  <a name="requests"></a>
    <div id="container_requests" class="geant"></div>
</div>

<div class="schema geant">
  <a name="responses"></a>
    <div id="container_responses" class="geant"></div>
</div>

            </div>
        </div>
    </div>
</div>`;
    const mySafeHTML = DOMPurify.sanitize(myHTML);
    
    return (
        <div dangerouslySetInnerHTML={{__html: mySafeHTML}}></div>
    )
};
export default Results