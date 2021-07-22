/*
Name          : joy.js
@author       : Kethan Vegunta (kethan1)
@original_author       : Roberto D'Amico (Bobboteck)

The MIT License (MIT)

Original file is part of the JoyStick Project (https://github.com/bobboteck/JoyStick).
Original work Copyright (c) 2015 Roberto D'Amico (Bobboteck).
Modified file is part of the JoyStick Project (https://github.com/kethan1/JoyStick).
Modified work Copyright (c) 2021 Kethan Vegunta (kethan1).

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

class JoyStick {
    #width;
    #height;
    #internalFillColor;
    #internalLineWidth;
    #internalStrokeColor;
    #externalLineWidth;
    #externalStrokeColor;
    #autoReturnToCenter;
    #canvas;
    #context;
    #pressed;
    #circumference;
    #internalRadius;
    #maxMoveStick;
    #externalRadius;
    #centerX;
    #centerY;
    #directionHorizontalLimitPos;
    #directionHorizontalLimitNeg;
    #directionVerticalLimitPos;
    #directionVerticalLimitNeg;
    #movedX;
    #movedY;

    constructor(container, parameters, callback) {
        this.parameters = parameters || {};
        this.callback = callback || function (x, y) {};
        var title = (typeof parameters.title === "undefined" ? "joystick" : parameters.title);
        this.#width = (typeof parameters.width === "undefined" ? 0 : parameters.width);
        this.#height = (typeof parameters.height === "undefined" ? 0 : parameters.height);
        this.#internalFillColor = (typeof parameters.internalFillColor === "undefined" ? "#00AA00" : parameters.internalFillColor);
        this.#internalLineWidth = (typeof parameters.internalLineWidth === "undefined" ? 2 : parameters.internalLineWidth);
        this.#internalStrokeColor = (typeof parameters.internalStrokeColor === "undefined" ? "#003300" : parameters.internalStrokeColor);
        this.#externalLineWidth = (typeof parameters.externalLineWidth === "undefined" ? 2 : parameters.externalLineWidth);
        this.#externalStrokeColor = (typeof parameters.externalStrokeColor ===  "undefined" ? "#008000" : parameters.externalStrokeColor);
        this.#autoReturnToCenter = (typeof parameters.autoReturnToCenter === "undefined" ? true : parameters.autoReturnToCenter);
        
        // Create Canvas element and add it in the Container object
        var objContainer = document.getElementById(container);
        this.#canvas = document.createElement("canvas");
        this.#canvas.id = title;
        if (this.#width === 0) this.#width = objContainer.clientWidth;
        if (this.#height === 0) this.#height = objContainer.clientHeight;
        this.#canvas.width = this.#width;
        this.#canvas.height = this.#height;
        objContainer.appendChild(this.#canvas);
        this.#context = this.#canvas.getContext("2d");
        
        this.#pressed = false;
        this.#circumference = 2 * Math.PI;
        this.#internalRadius = (this.#canvas.width-((this.#canvas.width/2)+10))/2;
        this.#maxMoveStick = this.#internalRadius + 5;
        this.#externalRadius = this.#internalRadius + 30;
        this.#centerX = this.#canvas.width / 2;
        this.#centerY = this.#canvas.height / 2;
        this.#directionHorizontalLimitPos = this.#canvas.width / 10;
        this.#directionHorizontalLimitNeg = this.#directionHorizontalLimitPos * -1;
        this.#directionVerticalLimitPos = this.#canvas.height / 10;
        this.#directionVerticalLimitNeg = this.#directionVerticalLimitPos * -1;
        // Used to save current position of stick
        this.#movedX = this.#centerX;
        this.#movedY = this.#centerY;
            
        this.#canvas.addEventListener("touchstart", (event) => this.#onTouchStart(event), {passive: false});
        document.addEventListener("touchmove", (event) => this.#onTouchMove(event), {passive: false});
        document.addEventListener("touchend", (event) => this.#onTouchEnd(event), {passive: false});
        this.#canvas.addEventListener("mousedown", (event) => this.#onMouseDown(event), false);
        document.addEventListener("mousemove", (event) => this.#onMouseMove(event), false);
        document.addEventListener("mouseup", (event) => this.#onMouseUp(event), false);
        // Draw the object
        this.#drawExternal();
        this.#drawInternal();
    }

	// Public methods
	
	/**
	 * @desc The width of canvas
	 * @return Number of pixel width 
	 */
	GetWidth() {
		return this.#canvas.width;
	};
	
	/**
	 * @desc The height of canvas
	 * @return Number of pixel height
	 */
	GetHeight() {
		return this.#canvas.height;
	};
	
	/**
	 * @desc The X position of the cursor relative to the canvas that contains it and to its dimensions
	 * @return Number that indicate relative position
	 */
	GetPosX() {
		return this.#movedX;
	};
	
	/**
	 * @desc The Y position of the cursor relative to the canvas that contains it and to its dimensions
	 * @return Number that indicate relative position
	 */
	GetPosY() {
		return this.#movedY;
	};
	
	/**
	 * @desc Normalizzed value of X move of stick
	 * @return Integer from -100 to +100
	 */
	GetX() {
		return (100 * ((this.#movedX - this.#centerX) / this.#maxMoveStick)).toFixed();
	};

	/**
	 * @desc Normalizzed value of Y move of stick
	 * @return Integer from -100 to +100
	 */
	GetY() {
		return ((100 * ((this.#movedY - this.#centerY) / this.#maxMoveStick)) * -1).toFixed();
	};
	
	/**
	 * @desc Get the direction of the cursor as a string that indicates the cardinal points where this is oriented
	 * @return String of cardinal point N, NE, E, SE, S, SW, W, NW and C when it is placed in the center
	 */
	GetDir() {
		var result = "";
		var orizontal = this.#movedX - this.#centerX;
		var vertical = this.#movedY - this.#centerY;
		
		if (vertical >= this.#directionVerticalLimitNeg && vertical <= this.#directionVerticalLimitPos) {
            result = "C";
        }
               
		else if (vertical < this.#directionVerticalLimitNeg) {
            result = "N";
        }
		else if (vertical > this.#directionVerticalLimitPos) {
            result = "S";
        }
		
		if (orizontal < this.#directionHorizontalLimitNeg) {
			if (result === "C") {
                result = "W";
            } else {
                result += "W";
            }
		} else if (orizontal > this.#directionHorizontalLimitPos)	{
			if (result === "C") {
                result = "E";
            } else {
                result += "E";
            }
		}

		return result;
	}

    // Private methods

    /*
	 * @desc Draw the external circle used as reference position
	 */
	#drawExternal() {
		this.#context.beginPath();
		this.#context.arc(this.#centerX, this.#centerY, this.#externalRadius, 0, this.#circumference, false);
		this.#context.lineWidth = this.#externalLineWidth;
		this.#context.strokeStyle = this.#externalStrokeColor;
		this.#context.stroke();
	}

	/**
	 * @desc Draw the internal stick in the current position the user have moved it
	 */
	#drawInternal() {
		this.#context.beginPath();
		if (this.#movedX < this.#internalRadius) {
            this.#movedX = this.#maxMoveStick;
        }
		if ((this.#movedX + this.#internalRadius) > this.#canvas.width) {
            this.#movedX = this.#canvas.width - (this.#maxMoveStick);
        }
		if (this.#movedY < this.#internalRadius) {
            this.#movedY = this.#maxMoveStick;
        }
		if ((this.#movedY + this.#internalRadius) > this.#canvas.height) {
            this.#movedY = this.#canvas.height - (this.#maxMoveStick);
        }
		this.#context.arc(this.#movedX, this.#movedY, this.#internalRadius, 0, this.#circumference, false);
		// create radial gradient
		var grd = this.#context.createRadialGradient(this.#centerX, this.#centerY, 5, this.#centerX, this.#centerY, 200);
		// Light color
		grd.addColorStop(0, this.#internalFillColor);
		// Dark color
		grd.addColorStop(1, this.#internalStrokeColor);
		this.#context.fillStyle = grd;
		this.#context.fill();
		this.#context.lineWidth = this.#internalLineWidth;
		this.#context.strokeStyle = this.#internalStrokeColor;
		this.#context.stroke();
	}
	
	/**
	 * @desc Events for managing touch
	 */
	#onTouchStart(event) {
		this.#pressed = true;
	}

	#onTouchMove(event) {
		// Prevent the browser from doing its default thing (scroll, zoom)
		event.preventDefault();
		if (this.#pressed && event.targetTouches[0].target === this.#canvas) {
			this.#movedX = event.targetTouches[0].pageX;
			this.#movedY = event.targetTouches[0].pageY;
			// Manage offset
			if (this.#canvas.offsetParent.tagName.toUpperCase() === "BODY") {
				this.#movedX -= this.#canvas.offsetLeft;
				this.#movedY -= this.#canvas.offsetTop;
			} else {
				this.#movedX -= this.#canvas.offsetParent.offsetLeft;
				this.#movedY -= this.#canvas.offsetParent.offsetTop;
			}
            this.callback(this.GetX(), this.GetY());
			// Delete canvas
			this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
			// Redraw object
			this.#drawExternal();
			this.#drawInternal();
		}
	} 

	#onTouchEnd(event) {
		this.#pressed = false;
		// If required reset position store variable
		if (this.#autoReturnToCenter) {
			this.#movedX = this.#centerX;
			this.#movedY = this.#centerY;
		}
        this.callback(this.GetX(), this.GetY());
		// Delete canvas
		this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
		// Redraw object
		this.#drawExternal();
		this.#drawInternal();
	}

	/**
	 * @desc Events for managing mouse
	 */
	#onMouseDown(event) {
		this.#pressed = true;
	}

	#onMouseMove(event) {
		if (this.#pressed) {
			this.#movedX = event.pageX;
			this.#movedY = event.pageY;
            this.callback(this.GetX(), this.GetY());
			// Manage offset
			if (this.#canvas.offsetParent.tagName.toUpperCase() === "BODY") {
				this.#movedX -= this.#canvas.offsetLeft;
				this.#movedY -= this.#canvas.offsetTop;
			} else {
				this.#movedX -= this.#canvas.offsetParent.offsetLeft;
				this.#movedY -= this.#canvas.offsetParent.offsetTop;
			}
			// Delete canvas
			this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
			// Redraw object
			this.#drawExternal();
			this.#drawInternal();
		}
	}

	#onMouseUp(event) {
		this.#pressed = false;
		// If required reset position store variable
		if (this.#autoReturnToCenter) {
			this.#movedX = this.#centerX;
			this.#movedY = this.#centerY;
		}
        this.callback(this.GetX(), this.GetY());
		// Delete canvas
		this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
		// Redraw object
		this.#drawExternal();
		this.#drawInternal();
	}
}

module.exports = JoyStick;
