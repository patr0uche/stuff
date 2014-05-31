$.fn.redraw = function(){
  $(this).each(function(){
    var redraw = this.offsetHeight;
  });
};
	
function getAngle(el){
	try{
		var st = window.getComputedStyle(el, null);
		var tr = st.getPropertyValue("-webkit-transform") ||
		         st.getPropertyValue("-moz-transform") ||
		         st.getPropertyValue("-ms-transform") ||
		         st.getPropertyValue("-o-transform") ||
		         st.getPropertyValue("transform") ||
		         "fail...";

		// With rotate(30deg)...
		// matrix(0.866025, 0.5, -0.5, 0.866025, 0px, 0px)
		

		// rotation matrix - http://en.wikipedia.org/wiki/Rotation_matrix

		var values = tr.split('(')[1];
		    values = values.split(')')[0];
		    values = values.split(',');
		var a = values[0];
		var b = values[1];
		var c = values[2];
		var d = values[3];

		var scale = Math.sqrt(a*a + b*b);

		// arc sin, convert from radians to degrees, round
		// DO NOT USE: see update below
		var sin = b/scale;
		var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
		return angle;
	}catch(er){
		return null;
	}
	
}
function setAngle($elem,angle){
	$elem.css("transform","rotateZ("+(angle)+"deg)");
}

function isIntersecting($circle1, $circle2){
	if(Math.abs(getAngle($circle1.get(0))-getAngle($circle2.get(0))) < 45){
		$(".value").css("background-color","red");
		return true;
	}else{
		$(".value").css("background-color","transparent");
		return false;
	}

}
function findCenter($elem){
	return {
		x : $elem.offset().left + $elem.width()/2,
		y : $elem.offset().top + $elem.height()/2
	};
}

function findAngle(e){
	var A, B, C;
	var a, b, c;
	// Center
	A = findCenter($(".wheel"));

	// Mouse
	B = {
		x : e.gesture.center.pageX,
		y : e.gesture.center.pageY
	};

	// 3rd point
	C = {
		x : B.x,
		y : A.y	
	}

	a = Math.abs(C.y - B.y);
	b = Math.abs(C.x - A.x);
	c = Math.sqrt(Math.pow(a,2)+Math.pow(b,2));

	var angle = Math.asin(a/c)*57.2957795;

	// Q1
	if(B.x < A.x && B.y < A.y){

	// Q2
	}else if(B.x > A.x && B.y < A.y){
		angle = 180 - angle;
	// Q3
	}else if(B.x > A.x && B.y > A.y){
		angle = 180 + angle;
	// Q4
	}else if(B.x < A.x && B.y > A.y){
		angle = 360 - angle;
	}
	// 45 : initial ajustement
	return angle-45;
}
function findCircle(e){
	var mouse ={
		x : e.gesture.center.pageX,
		y : e.gesture.center.pageY
	};
	var $found = null;

	$(".slider > div").each(function(){

		var square = {
			tl : {
				x : $(this).offset().left,
				y : $(this).offset().top
			},
			tr : {
				x : $(this).offset().left + $(this).width(),
				y : $(this).offset().top
			},
			br : {
				x : $(this).offset().left  + $(this).width(),
				y : $(this).offset().top  + $(this).height()
			},
			bl : {
				x : $(this).offset().left,
				y : $(this).offset().top  + $(this).height()
			}
		}
		if((mouse.x >= square.tl.x && mouse.x <= square.tr.x) &&
		(mouse.y >= square.tl.y && mouse.y <= square.br.y)){
			$found = $(this);			
			return true;
		}

	});
	return $found;
}


function draw(angle1,angle2){
	var angle = Math.abs(angle1-angle2);
	var left = (angle<180?angle:180);
	var right = (angle<180?0:(angle));
	
	if(angle2 > angle1){
		$(".cwrapper").css({
			"transform":"rotate("+angle1+"deg)"
		});
	}else{
		$(".cwrapper").css({
			"transform":"rotate("+angle2+"deg)"
		});
	}	

	if(!_clip){
		_clip = $(".cwrapper").css("clip");
	}
	if(angle > 180){
		$(".cwrapper").css({
			clip : "rect(auto, auto, auto, auto)"
		});
	}else{
		$(".cwrapper").css({
			clip : _clip
		})
	}

	$(".ccircle[data-anim*='left']").css({
		"transform":"rotate("+left+"deg)"
	});
	$(".ccircle[data-anim*='right']").css({
		"transform":"rotate("+right+"deg)"
	});

	$(".value.low").attr("data-angle",angle1).html(((angle1/360)*16).toFixed(1));
	$(".value.high").attr("data-angle",angle2).html(((angle2/360)*16).toFixed(1));

}



function findSliderAngles(){
	
	var _angles = {
		low : null,
		high : null
	};
	var tmp = [];
	$(".slider").each(function(){
		var angle, val;

		angle = getAngle($(this).get(0));	

		if(angle <0){
			angle = 315 + (45-Math.abs(angle));
		}

		var val = Math.floor(angle)-45;
		if(val < 0){
			val = 360 + val;
		}
		tmp.push(val);
	});

	if(tmp[0] > tmp[1]){
		_angles.low = tmp[1];
		_angles.high = tmp[0];
	}else{
		_angles.low = tmp[0];
		_angles.high = tmp[1];
	}
	
	return _angles;
}

function convert(angle){
	if(angle <0){
		angle = 315 + (45-Math.abs(angle));
	}

	var val = Math.floor(angle)-45;
	if(val < 0){
		val = 360 + val;
	}
	return val;
}



var _clip;
var _path;
var evt_count =0;
var _angles;

$(document).ready(function(){
	
	$(document).resize(function(){
		$(".wheel-container").redraw();
			
	})

	initWheel();

	/* Fixed height de la page */

	$(".fake-input").on("click",function(e){
		e.preventDefault();
		if(!$(e.target).hasClass("delete")){
			$("#regions").show();
			if($("#regions").height() < $(window).height()){
				$("#regions").css("height","100%");
			}

			setTimeout(function(){
				$(window).scrollTop(0);
				$("#regions, .anim").addClass("show");
				$(".main.wrapper").hide();

			},100);
		}
		
	});
	$("#regions").on("click",function(e){
		e.preventDefault();
		if(e.target.tagName.toLowerCase() == "li"){

			var args = $(e.target).text().replace("  "," ").split(" ");
			if($("#filter-regions li[data-value='"+args[0]+"']").length == 0){
				var $region = $("<li>"+args[1]+"</li>").attr("data-value",args[0]);
				var $delete = $("<span class='delete'>X</span>");
				$delete.on("click",function(e){
					e.preventDefault();
					$(this).parents("li").fadeOut("fast",function(){
						$(this).remove();
					});
				});
				$region.append($delete);
				$("#filter-regions").append($region);
			}
		}
		$(this, ".anim").removeClass("show");
		setTimeout(function(){
			$("#regions").hide();
			$(".main.wrapper").show();
		},100);

	});

	$(".colors a").on("click",function(e){
		e.preventDefault();
		//$("input").val($(this).closest("li").attr("class"));
		$(this).find(".flip-container").toggleClass("selected");
	})

	var interval;

	var _angle = null;



	



	/* SLIDER */
	(function(){
		var timeout_id;

		var speed = 5000;
		var $slider = $(".main-container .featured");
		var $elems = $(".featured li");
		var $dots = $("<ol class='dots'></ol>");

		var auto = function(){
			timeout_id = setTimeout(function(){
				var $click;
				if($dots.find(".active").index() < $dots.find("li:last").index()){
					$click = $(".dots").find(".active").next("li");
				}else{
					$click = $(".dots").find("li:first");
				}	
				$click.addClass("active").trigger("click");
			},speed);

		}

		$(".featured").hammer({ 
	        	drag_max_touches:0,
	 			prevent_default: true,
	            no_mouseevents: true
	        }).on("swipeleft swiperight",function(e){
	        	var $click;

	        	if(e.type == "swipeleft"){
					if($dots.find(".active").index() < $dots.find("li:last").index()){
						$click = $(".dots").find(".active").next("li");
					}else{
						$click = $(".dots").find("li:first");
					}	
	        	}else{
        			if($dots.find(".active").index() > $dots.find("li:first").index()){
						$click = $(".dots").find(".active").prev("li");
					}else{
						$click = $(".dots").find("li:last");
					}	

	        	}

				
				$click.addClass("active").trigger("click");
	        });


		$elems.first().addClass("active");
		$elems.each(function(){
			var $img = $(this).find("img").clone().toggleClass("blur noblur").css({
				height : $(this).find("img").height(),
				width : $(this).find("img").width()
			});
			var $noblur = $("<div class='circle' />").append($("<div class='border' />")).append($("<div class='container' />").append($img));

			$(this).find("img").after($noblur);
			$noblur = $(this).find(".noblur");

			var diff = ((parseInt($noblur.closest(".circle").find(".border").css("height") ,10) - parseInt($noblur.closest(".circle").find(".container").height(),10))/16 + 1);


			$(window).resize(function(){
				console.log($noblur.parents(".container:last").height());
				// TODO : Extrapoler la valeur finale pis faire une anim css3 avec le meme delais que le resize
				var leresize = function(time){
					$noblur.css({
						height : $noblur.parents(".container:last").find(".blur").height(),
						width : $noblur.parents(".container:last").find(".blur").width(),
						'margin-top' : -(($noblur.closest(".circle").height()-$noblur.closest(".container").height()) / 2)+(parseInt($noblur.css("font-size"),10)*diff),
						'margin-left' : -(($noblur.closest(".circle").width()-$noblur.closest(".container").width()) / 2)
					});
					if(time < 1000){
						setTimeout(function(){
							time+=50;
							leresize(time);
						},10);
					}
				}
				leresize(0);
			});

			$noblur.css({
				'margin-top' : -(($noblur.closest(".circle").height()-$noblur.closest(".container").height()) / 2)+(parseInt($noblur.css("font-size"),10)*diff),
				'margin-left' : -(($noblur.closest(".circle").width()-$noblur.closest(".container").width()) / 2)
			});

			$dots.append($("<li class='dot'>"+ ($(this).index()+1) +"</li>"));
		});

		$dots.find(".dot").on("click",function(e){
			e.preventDefault();
			clearTimeout(timeout_id);
			$(this).addClass("active").siblings().removeClass("active");
			$slider.find("ul .blurin, ul .blurout").removeClass("blurin blurout");
			$slider.find("ul li").filter(".active").addClass("blurout").end().eq($(this).index()).addClass("active blurin").siblings().removeClass("active");
			auto();
			$dots.redraw();
		});
		$dots.find("li").first().addClass("active");
		$slider.append($dots);

		auto();
	})();



	$("#search-button").on("click",function(e){
		e.preventDefault();
		var extra = "";
		// Regions
		if($("#filter-regions li").length > 0){
			var regions = "";
			$("#filter-regions li").each(function(){
				regions += ","+ $(this).attr("data-value");
			});
			extra += "&region="+ regions.substr(1);
		}

		extra += "&alcohol="+ $(".wheel .low.value").text() +":"+ $(".wheel .high.value").text();

		$.ajax({
	        type: 'GET',
	        contentType: 'application/json',
	        url: "api/search?q="+$("#keywords").val()+extra,
	        dataType: "json",
	        success: function(data, textStatus, jqXHR){
	        	$("#results").empty();
	        	if(data.length > 0){
	        		$("#results").append($("<ul />"));
	        	}
	        	for(var i=0;i<data.length;i++){
	        		$("#results ul").append($("<li><a href='api/beers/"+data[i].stripped+"'><span class='webfont' style='color:#"+co('')+"'>f</span><span>"+data[i].name+ "</span> <span>"+data[i].alcohol +"</span></a></li>"));
	        	}

	        },
	        error: function(jqXHR, textStatus, errorThrown){

	        }
	    });
	});



	/* FACEBOOK */
	$("#facebook").on("click",function(e){
		e.preventDefault();

		 FB.login();
	})



});
function co(lor){   
	return (lor +=
  [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
  && (lor.length == 6) ?  lor : co(lor); 
}



function initWheel(){
	var evt_count = 0;
	if($(".ccircle").length > 0){

		_angles = findSliderAngles();
		draw(_angles.low,_angles.high);
		$(".wheel-container")
	        .hammer({ 
	        	drag_max_touches:0,
	 			prevent_default: true,
	            no_mouseevents: true
	        })
	        .on("touch", function(e) {
	        	e.preventDefault();

	        	$(".wheel-container").off("drag.slider-low drag.slider-high release");


				var $circle = findCircle(e);
				if(!$circle){
					return false;
				}
				$circle.addClass("active");

				evt_count = 0;

				var affix = $circle.attr("class").match("low")?"low":"high";
				var $slider = $circle.closest(".slider");

				/* DRAG EVENT */
				$(".wheel-container").hammer().on("drag.slider-"+affix  ,function(e){
					evt_count++;
					//$("input").val(e.type + " " + evt_count + " " + e.gesture.direction);
					
					if(evt_count % 2 == 0){

						var angle, val;

						angle = findAngle(e);	

						if(angle <0){
							angle = 315 + (45-Math.abs(angle));
						}

						var val = Math.floor(angle)-45;
						if(val < 0){
							val = 360 + val;
						}
						_angles = findSliderAngles();

						/*if(affix == "low" && (e.gesture.direction == "up" || e.gesture.direction == "left")){
							
							if(val == 0 || val >= 340){
								$(".wheel-container").off("drag.slider-"+affix);
								draw(0,_angles.high);
								setAngle($slider,45);
								return false;
							}
						}else if(affix == "high" && (e.gesture.direction == "up" || e.gesture.direction == "right")){
							if(val == 0 || val <= 20){
								$(".wheel-container").off("drag.slider-"+affix);
								draw(_angles_low,359.9);
								setAngle($slider,44.9);
								return false;
							}
						}*/
						draw(_angles.low,_angles.high);
						setAngle($slider,angle);
					}
				});

				$(".wheel-container").hammer().on("release.slider-"+affix,function(){		
					$circle.removeClass("active");
					setTimeout(function(){
						var _angles = findSliderAngles();
						//console.log(_angles);

						draw(_angles.low,_angles.high)
					},10);
					//$("input").val(e.type + " " + e.gesture.direction);
					$(".wheel-container").off("drag.slider-"+affix);			
				});
		});
	}
}