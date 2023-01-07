import React from 'react';
import { useState } from 'react';
import './App.css';
import Canvas from './Canvas'
import waveforms from './waveforms1.json';


var prevdraw = []
var coord = undefined;
function App() {

  // let disp = fetch("./waveforms1.json")
  // .then(response => {return response.json()})
  // .then(data => console.log(data))
  var first_set = waveforms[0]
  //time is in microseconds
  var name = first_set[0]
  // var no_of_segments = first_set[1]
  var time_segments = first_set.slice(2,-1)
  var total_time = first_set.slice(2,-1).reduce((a, b) => {return Number(a)+Number(b)})

  // console.log(name)
  // console.log(no_of_segments)
  // console.log(total_time)

  var canvas_height = 700
  var canvas_width = 1000

  let [state, setState] = useState({
    "X_MIDPOINT" : 10,
    "Y_MIDPOINT": 10, 
    "Y_BASELINE" : 20, 
    "GRAPH_HEIGHT" : 100, 
    "TIME_SCALE" : 1, 
    "TIME_OFFSET" : 50,
    "Y_SCALE" : 1, 
    "LINE_WIDTH" : 1,
    "CHANNS" : { "go" : {"YOFF" : 1}, "power" : {"YOFF" : 1}},
    "MOUSE" : {"UP" : [0,0,0], "MOVE" : [0,0,0], "DOWN" : [0,0,0]}
  })

  let x_midpoint = (mp, fg1) => { if( mp === undefined) { return(state["X_MIDPOINT"]);} else { console.log("Mod x_midpoint " + mp); setState({...state, "X_MIDPOINT" : mp})} }
  let y_midpoint = (mp, fg1) => { if( mp === undefined) { return(state["Y_MIDPOINT"]);} else { console.log("Mod y_midpoint " + mp); setState({...state, "Y_MIDPOINT" : mp})} }
  let y_baseline = (mp) => { if( mp === undefined) { return(state["Y_BASELINE"]);} else { console.log("Mod y_baseline " + mp); setState({...state, "Y_BASELINE" : mp})} }
  let graph_height = (mp) => { if( mp === undefined) { return(state["GRAPH_HEIGHT"]);} else { console.log("Mod graph_height"); setState({...state, "GRAPH_HEIGHT" : mp})} }
  let time_scale = (mp, fg1) => { if( fg1 !== undefined) {return({"TIME_SCALE" : mp});}; if( mp === undefined) { return(state["TIME_SCALE"]);} else { setState({...state, "TIME_SCALE" : mp})} }
  let time_offset = (mp, fg1) => { if( fg1 !== undefined) {return({"TIME_OFFSET" : mp});} if( mp === undefined) { return(state["TIME_OFFSET"]);} else {console.log("setState TimeOffset=" + mp); setState({...state, "TIME_OFFSET" : mp})} }
  let y_scale = (mp) => { if( mp === undefined) { return(state["Y_SCALE"]);} else {setState({...state, "Y_SCALE" : mp})} }
  // console.log("yscale is " + y_scale())

  let line_width = (mp) => { if( mp === undefined) { return(state["LINE_WIDTH"]);} else { console.log("Mod line_width " + mp); setState({...state, "LINE_WIDTH" : mp})} }

  // midpoint(midpoint() + 5)
  // var [midpoint, setMidpoint] = useState(canvas_height/2)

  // var [baseline, setBaseline] = useState(200)
  function baseline_y (val1) { return(val1 - y_baseline());}

  // var [graph_height, setGraphHeight] = useState(200)

  // //in pixels per ms
  let x_scale = () => canvas_width/total_time
  if (coord === undefined ) {
    coord = waveforms.map((time, index) => {
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
  function draw(context, canvas) {
    //low is y=500
    //high is y=100

    context.lineWidth = line_width()

    let current_x = 0 + time_offset()
    let y_0axis = 500
    let current_y = y_0axis 

    // console.log("curr x is " + current_x + " and curr y is " + current_y)
    // context.clearRect(0, 0, canvas.width, canvas.height)
    // context.stroke()
    context.beginPath()
    context.globalCompositeOperation = "destination-out"
    // context.globalCompositeOperation = "source-over"
    context.clearRect(0,0, canvas_width, canvas_height)
    context.globalCompositeOperation = "source-over"
    // context.moveTo(current_x, baseline_y(current_y))
    // prevdraw.map((a1) => {
    //   var c1 = a1[0]; var c2 = a1[1]; var c3 = a1[2];
    //   context.moveTo(c1); context.lineTo(c2); context.lineTo(c3)
    // } )

    // var draw_y;
    

    // console.log(coord)
    // console.log("-------")
    // console.log(coord[0]["go        "].slice(-1).slice(-1)[0].slice(-1)[0][0])
    if(coord === undefined) {return(0);}
    let coord2 = coord.reduce((prev, curr) => {return({...prev, ...curr})})
    // console.log(coord2)

    let target_command = coord2["go        "]
    // console.log(target_command)

    // let x_span = target_command.slice(-1)[0].slice(-1)[0][0]
    // console.log(x_span)

    function get_x_mapfunc(cartesian_coords){
      let x_span = cartesian_coords.slice(-1)[0].slice(-1)[0][0]
      return((x) => x * canvas_width/x_span )
    }

    function get_y_mapfunc(){
      return((y) => (2-y) * canvas_height * (1/3))
    }

    let x_map = get_x_mapfunc(target_command);
    let y_map = get_y_mapfunc(target_command); 
    prevdraw = []
    var outRng = 0;
    var lastOutRng = [];

    target_command.map((to_draw) => {

        var a1 = to_draw[0]; 
        var a2 = to_draw[1]; 
        var a3 = to_draw[2]; 

        var c1 = [x_map(a1[0]) *  time_scale() + 2 + time_offset(), baseline_y(y_map(a1[1]) / y_scale())]
        var c2 = [x_map(a2[0]) *  time_scale() + time_offset(), baseline_y(y_map(a2[1]) / y_scale())]
        var c3 = [x_map(a3[0]) *  time_scale() + 2 + time_offset(), baseline_y(y_map(a3[1]) / y_scale())]

        // console.log(c1)
        // console.log(c2)
        // console.log(c3)
        let check_x = (c1) => c1[0] > 0 && c1[0] < canvas_width
        if(check_x(c1) && check_x(c2)) { 
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
          console.log("X out of range " + c1[0] + "-----" + c2[0])
        }
    })

    // time_segments.map((time, index) =>
    //   {
    //   //first the horizontal line
    //   current_x = current_x + (x_scale() * time ) + time_scale()
    //   draw_y = current_y - (y_0axis - current_y) * y_scale()
    //   context.lineTo(current_x, baseline_y(draw_y))
    //   context.stroke()
    //   //then whether you draw up or down
    //   if (index % 2===0){ //this means low, and need to go up
    //     current_y = current_y - graph_height() 
    //   }
    //   else { //this means high
    //     current_y = current_y + graph_height()
    //   }
    //   draw_y = current_y - (y_0axis - current_y) * y_scale()

    //   context.lineTo(current_x, baseline_y(draw_y ))
    //   context.stroke()
    //   })
  }

  let mscbFunc = (m,x,y, e1) => { 
    if (e1.getModifierState("Shift")) {console.log("------- Shift pressed") }
    if(m === "DOWN") { console.log("mousedown"); setState({...state, "MOUSE" : {...state["MOUSE"], "LAST_TIMEOFFSET" : time_offset(),"LAST_TIMESCALE" : time_scale(), "DOWN" : [x,y,1], "MOVE" : [0,0,0], "UP" : [0,0,0]}}) } 
    if(m === "UP") {console.log("mouseup");  setState({...state, "MOUSE" : {...state["MOUSE"], "DOWN" : [0,0,0], "MOVE" : [0,0,0], "UP" : [x,y,1]}}) } 
    if(m === "MOVE" && state["MOUSE"]["DOWN"][2] === 1) {
      console.log("mousemove") 
      var dn1 = state["MOUSE"]["DOWN"] 
      var mv1 = state["MOUSE"]["MOVE"]
      var mgHash = {}
      if(dn1[2] === 1) { 
        if (e1.getModifierState("Shift")){
          var to_set = (x - dn1[0])/100;  mgHash = time_scale(to_set + state["MOUSE"]["LAST_TIMESCALE"],1 );
        } else {
          var to_set = (x - dn1[0])/2;  mgHash = time_offset(to_set + state["MOUSE"]["LAST_TIMEOFFSET"],1 );
        }
      }
      console.log("actual value is time offset is now " + state["TIME_OFFSET"])
      console.log("---------- Mouse -----------------")
      console.log(state["MOUSE"])
      setState({...state, ...mgHash, "MOUSE" : {...state["MOUSE"], "DOWN" : state["MOUSE"]["DOWN"], "MOVE" : [x,y,1], "UP" : state["MOUSE"]["UP"]}}) 
      } 
  } 
  return (
    <div className="App">

      {/* {waveforms.map((comm) => 
        <p> {comm} </p>
      )} */}

      <Canvas draw={draw} height={canvas_height+"px"} width={canvas_width+"px"} mscbFunc={mscbFunc}></Canvas>

      {/* <button> Draw </button> */}

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
