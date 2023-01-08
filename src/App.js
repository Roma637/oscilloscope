import React from 'react';
import { useState } from 'react';
import './App.css';
import Canvas from './Canvas'
import waveforms from './waveforms1.json';


var prevdraw = []
var coords = undefined;
var  y_bounds = undefined
var  x_bounds = undefined
var bound_rect_leg = undefined
var bound_rect_wav = undefined

function App() {

  var canvas_height = 500
  var canvas_width = 900

  let [state, setState] = useState({
    "X_MIDPOINT" : 10,
    "Y_MIDPOINT": 10, 
    "Y_BASELINE" : 20, 
    "GRAPH_HEIGHT" : 80, 
    "GRAPH_WIDTH":10,
    "TIME_SCALE" : 1, 
    "TIME_OFFSET" : 50,
    "Y_SCALE" : 1, 
    "LINE_WIDTH" : 1,
    // "COMMANDS" : { "go" : {"Y_OFF" : 1}, "power" : {"Y_OFF" : 1}},
    "COMMANDS" : { },
    // "COMMANDS" : [{"name":"go", }]
    "MOUSE" : {"UP" : [0,0,0], "MOVE" : [0,0,0], "DOWN" : [0,0,0]}
  })

  // console.log(state)

  let x_midpoint = (mp) => { if( mp === undefined) { return(state["X_MIDPOINT"]);} else { console.log("Mod x_midpoint " + mp); setState({...state, "X_MIDPOINT" : mp})} }
  let y_midpoint = (mp) => { if( mp === undefined) { return(state["Y_MIDPOINT"]);} else { console.log("Mod y_midpoint " + mp); setState({...state, "Y_MIDPOINT" : mp})} }
  let y_baseline = (mp, fg1) => {if( fg1 !== undefined) {return({"Y_BASELINE" : mp});}; if( mp === undefined) { return(state["Y_BASELINE"]);} else { console.log("Mod y_baseline " + mp); setState({...state, "Y_BASELINE" : mp})} }
  let graph_height = (mp) => { if( mp === undefined) { return(state["GRAPH_HEIGHT"]);} else { console.log("Mod graph_height"); setState({...state, "GRAPH_HEIGHT" : mp})} }
  let graph_width = (mp) => { if( mp === undefined) { return(state["GRAPH_WIDTH"]);} else { console.log("Mod graph_width"); setState({...state, "GRAPH_WIDTH" : mp})} }
  let time_scale = (mp, fg1) => { if( fg1 !== undefined) {return({"TIME_SCALE" : mp});}; if( mp === undefined) { return(state["TIME_SCALE"]);} else { setState({...state, "TIME_SCALE" : mp})} }
  let time_offset = (mp, fg1) => { if( fg1 !== undefined) {return({"TIME_OFFSET" : mp});} if( mp === undefined) { return(state["TIME_OFFSET"]);} else {console.log("setState TimeOffset=" + mp); setState({...state, "TIME_OFFSET" : mp})} }
  let y_scale = (mp, fg1) => { if( fg1 !== undefined) {return({"Y_SCALE" : mp});} if( mp === undefined) { return(state["Y_SCALE"]);} else {setState({...state, "Y_SCALE" : mp})} }

  let line_width = (mp) => { if( mp === undefined) { return(state["LINE_WIDTH"]);} else { console.log("Mod line_width " + mp); setState({...state, "LINE_WIDTH" : mp})} }

  function baseline_y (val1) { return(val1 - y_baseline());}
  
  if (coords === undefined ) {
    coords = waveforms.map((time, index) => {
      //time stands for one complete array
      var hash1 = {} //initialise a hash
      var arr1 = time.slice(2,-1) //arr1 holds all the timings in microseconds, with the first being LOW
      var acc1 = Number(arr1[0]) //the first timing
      var num1 = 0; var num2 = 1;
      hash1[time[0]] = arr1.slice(1).map(
        (v1, indx1) => 
                {
                    var rv1 = [[acc1, num1],[acc1 + Number(arr1[indx1]), num1], [acc1 + Number(arr1[indx1]), num2]] ;
                    acc1 = acc1 + Number(arr1[indx1])
                    if(num1 === 0) { num1 = 1 ; num2 = 0;}
                    else { num1 = 0; num2 = 1; }
                    return(rv1)
                });
        return(hash1);
    })
  }
  if ( y_bounds === undefined)  {
    y_bounds = coords.map((it1, indx1) => indx1 * canvas_height/coords.length )
    y_bounds = [...y_bounds, canvas_height]
  }
  if ( x_bounds === undefined)   {
    x_bounds = coords.map((it1, indx1) => indx1 * canvas_width/coords.length )
    x_bounds = [...x_bounds, canvas_width]
    bound_rect_leg = coords.map((v1, ii) => [[x_bounds[ii], y_bounds[ii]],[x_bounds[ii + 1], y_bounds[ii + 1]]])
    bound_rect_wav = coords.map((v1, ii) => [[x_bounds[ii], 0],[x_bounds[ii + 1], canvas_width]])
  }
 
  
  
  console.log("BOUNDS")
  console.log(y_bounds)
  console.log(x_bounds)

  
  console.log("======= COORD ========")
  console.log(coords)

  //calculate the height of each graph
  state["GRAPH_HEIGHT"] = canvas_height/coords.length
  // console.log("the height of each graph is " + graph_height())

  //the span of each graph
  state["GRAPH_WIDTH"] = canvas_width/coords.length
  // console.log("the span of each graph is" + graph_width())

  //the highs and lows for each graph
  var graph_high = 0.1 * graph_height()
  var graph_low = 0.9 * graph_height()

  //do the math and assign each graph its own y offset and x-offset

  waveforms.map( (v1) => v1[0].trim()).map((pv, index) => { 
    state["COMMANDS"][pv] = {"Y_OFF" : index * graph_height(), "X_OFF" : index * graph_width()}
    // console.log("INDEX IS " + index)
  })

  // console.log("==== COMMANDS =====")
  // console.log(state["COMMANDS"])

  // console.log("==== state =====")
  // console.log(state)

  function draw(coord, context, arrindx) {

    console.log("drawing " + Number(arrindx+1))

    context.lineWidth = line_width()

    // let current_x = 0 + time_offset()
    // let y_0axis = 500
    // let current_y = y_0axis 


    context.globalCompositeOperation = "source-over"

    // if(coords === undefined) {return(0);}
    // let coords2 = coords.reduce((prev, curr) => {return({...prev, ...curr})})
    // console.log(coord2)

    let command_name = Object.entries(coord)[0][0].trim()
    let x_items = Object.entries(coord)[0][1]
    console.log('=======X ITEMS=========')
    console.log(x_items)

    // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA")
    // console.log(command_name)
    // console.log(x_items)

    // console.log('--------')
    // console.log(state["COMMANDS"][command_name])

    var current_x_offset = state["COMMANDS"][command_name]["X_OFF"]
    var current_y_offset = state["COMMANDS"][command_name]["Y_OFF"]


    function get_x_mapfunc(cartesian_coords){
      let x_span = cartesian_coords.slice(-1)[0].slice(-1)[0][0]
      return((x) => x * canvas_width/x_span )
    }

    function get_y_mapfunc(){
      // console.log("using graph height")
      console.log("y func mapping")
      return((y) => (1-y) * graph_height())
      // return((y) => (2-y) * canvas_height * (1/3))
    }

    let x_map = get_x_mapfunc(x_items);
    let y_map = get_y_mapfunc(x_items); 

    prevdraw = []
    var outRng = 0;
    var lastOutRng = [];
    var lowfail = undefined;
    var highfail = undefined;
    var drawcount = 0;
    x_items.map((to_draw) => {

        var a1 = to_draw[0]; 
        var a2 = to_draw[1]; 
        var a3 = to_draw[2]; 

        // var c1 = [x_map(a1[0]) *  time_scale() + time_offset() + current_x_offset, baseline_y(y_map(a1[1]) / y_scale()) + current_y_offset]
        // var c2 = [x_map(a2[0]) *  time_scale() + time_offset() + current_x_offset, baseline_y(y_map(a2[1]) / y_scale()) + current_y_offset]
        // var c3 = [x_map(a3[0]) *  time_scale() + time_offset() + current_x_offset, baseline_y(y_map(a3[1]) / y_scale()) + current_y_offset]
        var c1 = [x_map(a1[0]) *  time_scale() + time_offset(), baseline_y(y_map(a1[1]) / y_scale()) + y_bounds[arrindx]]
        var c2 = [x_map(a2[0]) *  time_scale() + time_offset(), baseline_y(y_map(a2[1]) / y_scale()) + y_bounds[arrindx]]
        var c3 = [x_map(a3[0]) *  time_scale() + time_offset(), baseline_y(y_map(a3[1]) / y_scale()) + y_bounds[arrindx]]

        // var c1 = [x_map(a1[0]) *  time_scale() + time_offset() +  50 * arrindx , baseline_y(y_map(a1[1]) / y_scale()) ]
        // var c2 = [x_map(a2[0]) *  time_scale() + time_offset() +  50 * arrindx , baseline_y(y_map(a2[1]) / y_scale()) ]
        // var c3 = [x_map(a3[0]) *  time_scale() + time_offset() +  50 * arrindx , baseline_y(y_map(a3[1]) / y_scale()) ]

        // console.log(c1)
        // console.log(c2)
        // console.log(c3)

        let check_x = (c1) => c1[0] > 0 && c1[0] < canvas_width
        let check_x_low  = (c1) => c1[0] > 0 
        let check_x_high  = (c1) =>  c1[0] < canvas_width
        if(! check_x_low(c3)) {lowfail = [c1,c2,c3]; }
        if(highfail === undefined && ! check_x_high(c1)) {highfail = [c1,c2,c3]; }
        if(check_x(c1) && check_x(c2)) { 
          drawcount = drawcount + 1
          prevdraw = [...prevdraw, [c1,c2,c3]]
          if (lastOutRng.length > 0 ) {
            context.moveTo(...lastOutRng[0]) 
            context.lineTo(...lastOutRng[1])
            context.lineTo(...lastOutRng[2]);
          }
          context.moveTo(...c1) 
          context.lineTo(...c2)
          context.lineTo(...c3);
          // if(check_x(c3))  {  }
          context.stroke()
          outRng += 1;
          lastOutRng = []
        } else {
          lastOutRng = [c1,c2,c3]
          if(outRng > 0) {
            prevdraw = [...prevdraw, [c1,c2,c3]]
            context.moveTo(...c1) 
            context.lineTo(...c2)
            context.lineTo(...c3);
            // if(check_x(c3))  {  }
            context.stroke()            
          }
          outRng = 0
          if(drawcount === 0) {
            if(highfail !== undefined && lowfail !== undefined) {
              var [c1a,c2a,c3a] = lowfail
              var [c1b,c2b,c3b] = highfail
              context.moveTo(...c1a)
              context.lineTo(...c3b)
              context.stroke()  
            } else {
              console.log("highfail or lowail is undefined - not a big issue though")
              console.log(lowfail)
              console.log(highfail)
            }
        }
          // console.log("X out of range " + c1[0] + "-----" + c2[0])
        }
    })
  }

  function draw2(context) {

    context.beginPath()
    context.globalCompositeOperation = "destination-out"

    context.clearRect(0,0, canvas_width, canvas_height)

    //for item in coords, draw() while passing coords to it

    coords.map((coord, indx) => draw(coord, context, indx))

  }

  function draw3(context) {
    // console.log("second canvas talking here!")
  }
  var y_to_set=0;
  let mscbFunc = (m,x,y, e1) => { 
    var to_set = 0; var to_offset = 0; var to_set_y = 0;
    if (e1.getModifierState("Shift")) {console.log("------- Shift pressed") }
    if(m === "DOWN") { console.log("mousedown"); setState({...state, "MOUSE" : {...state["MOUSE"], "LAST_TIMEOFFSET" : time_offset(),"LAST_TIMESCALE" : time_scale(),"LAST_YSCALE" : y_scale(),  "DOWN" : [x,y,1], "MOVE" : [0,0,0], "UP" : [0,0,0], "LAST_YOFFSET" : y_baseline()}}) } 
    if(m === "UP") {console.log("mouseup");  setState({...state, "MOUSE" : {...state["MOUSE"], "DOWN" : [0,0,0], "MOVE" : [0,0,0], "UP" : [x,y,1]}}) } 
    if(m === "MOVE" && state["MOUSE"]["DOWN"][2] === 1) {
      console.log("mousemove") 
      var dn1 = state["MOUSE"]["DOWN"] 
      var mgHash = {}; var mgyHash = {};
      let f_scale = (cx, dnx) => {return((cx - dnx)/100);}
      let fy_scale = (cy, dny) => {return((cy - dny)/100);}
      let f_offset = (cx, dnx) => {return((cx - dnx)/2);}
      if(dn1[2] === 1) { 
        if (e1.getModifierState("Shift")){
          console.log("last X = " + dn1[0] + "    curr X=" + x)
          to_set = f_scale (x , dn1[0]); 
          var esx1 = to_set + state["MOUSE"]["LAST_TIMESCALE"]
          mgHash = time_scale(esx1,1 );
          to_offset = (2 * state["MOUSE"]["LAST_TIMEOFFSET"])  -  (esx1 * state["MOUSE"]["LAST_TIMEOFFSET"])
          y_to_set = fy_scale(y, dn1[1])
          var esy1 = y_to_set + state["MOUSE"]["LAST_YSCALE"]
          mgyHash = y_scale(esy1,1)
          mgHash = {...mgHash,  ...mgyHash ,  ...time_offset(to_offset, 1)}
        } else {
          to_set = f_offset(x ,dn1[0]); mgHash = time_offset(to_set + state["MOUSE"]["LAST_TIMEOFFSET"],1 );
          to_set_y = -(y - dn1[1]) ; mgHash = {...mgHash, ...y_baseline(to_set_y + state["MOUSE"]["LAST_YOFFSET"],1)}
        }
      }
      console.log("actual value of time offset is now " + state["TIME_OFFSET"])
      console.log("---------- Mouse -----------------")
      console.log(state["MOUSE"])
      setState({...state, ...mgHash, "MOUSE" : {...state["MOUSE"], "DOWN" : state["MOUSE"]["DOWN"], "MOVE" : [x,y,1], "UP" : state["MOUSE"]["UP"]}}) 
      } 
  } 

  return (
    <div className="App">

      <table><tr>
      <th>
      <Canvas id="a" draw={draw2} height={canvas_height+"px"} width={canvas_width+"px"} mscbFunc={mscbFunc}></Canvas>
      </th>
      <th>
      <Canvas id="b" draw={draw3} height={canvas_height+"px"} width={"200px"} mscbFunc={mscbFunc}></Canvas>
      </th>
      </tr></table>

      <div id="control_buttons" >
      <button onClick={ (e1) => time_scale(Math.min(time_scale() + 0.2, 10))}> Strech X </button>
        <button onClick={ (e1) => time_scale(Math.max(time_scale() - 0.2, 1))}> Shrink X </button>

        <button onClick={ (e1) => {console.log("Move left time_offset=" + time_offset()); time_offset(time_offset() - 10)}}> Move Left </button>
        <button onClick={ (e1) => time_offset(time_offset() + 10)}> Move Right </button>
        {/* <button> Go to end </button> */}
        <br/>
        {/* these two work */}
        <button onClick={ (e1) => y_scale(Math.max(y_scale() - 0.4, 0.2))}> Scale Y + </button>    
        <button onClick={ (e1) => y_scale(Math.min(y_scale() + 0.4, 10))}> Scale Y - </button>        
        <button onClick={ (e1) => y_baseline(y_baseline() + 10)}> Move Up </button>
        <button onClick={ (e1) => y_baseline(y_baseline() - 10)}> Move Down </button>
        <br/>
        {/* these two do not */}
        <br/>
        <br/>    
      </div>

    </div>
  );
}
export default App;