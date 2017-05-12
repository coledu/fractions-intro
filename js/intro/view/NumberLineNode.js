// Copyright 2013-2017, University of Colorado Boulder

/**
 * The horizontal number line that shows the values
 *
 * @author Vincent Davis (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var fractionsIntro = require( 'FRACTIONS_INTRO/fractionsIntro' );
  var inherit = require( 'PHET_CORE/inherit' );
  var IntroConstants = require( 'FRACTIONS_INTRO/intro/IntroConstants' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );

  /**
   * @param {Property.<number>} maxNumberOfUnitsProperty
   * @param {Property.<number>} denominatorProperty
   * @param {Object} [options]
   * @constructor
   */
  function NumberLineNode( maxNumberOfUnitsProperty, denominatorProperty, options ) {
    Node.call( this );

    // main Number line
    var mainNumberLine = new Line( 0, 0, IntroConstants.NUMBER_LINE_WIDTH, 0, { stroke: 'black' } );
    this.addChild( mainNumberLine );

    // Even Major Ticks, Width of line is slightly thicker than the odd Major Ticks
    var evenMajorTicksPath = new Path( null, { stroke: 'black', lineWidth: 5 } );
    this.addChild( evenMajorTicksPath );

    // odd Major Ticks
    var oddMajorTicksPath = new Path( null, { stroke: 'black', lineWidth: 3 } );
    this.addChild( oddMajorTicksPath );

    // Minor Ticks
    var minorTicksPath = new Path( null, { stroke: 'black', lineWidth: 1 } );
    this.addChild( minorTicksPath );

    // Present for the lifetime of the simulation
    // Updates the minor and major ticks as well as the main number line
    Property.multilink( [ maxNumberOfUnitsProperty, denominatorProperty ], function( maxNumberOfUnits, denominator ) {
      var segmentLength = IntroConstants.NUMBER_LINE_WIDTH / IntroConstants.MAX_NUMBER_OF_UNITS_RANGE.max;

      // sets the length of the main number line
      mainNumberLine.setX2( segmentLength * maxNumberOfUnits );

      // create major ticks shape
      var evenMajorTicksShape = new Shape();
      var oddMajorTicksShape = new Shape();

      for ( var i = 0; i <= maxNumberOfUnits; i++ ) {

        // major tick line width varies for even and odd number of units
        if ( i % 2 === 0 ) {
          evenMajorTicksShape.moveTo( i * segmentLength, -IntroConstants.MAJOR_TICK_LENGTH ).verticalLineToRelative( 2 * IntroConstants.MAJOR_TICK_LENGTH );
        }
        else {
          oddMajorTicksShape.moveTo( i * segmentLength, -IntroConstants.MAJOR_TICK_LENGTH ).verticalLineToRelative( 2 * IntroConstants.MAJOR_TICK_LENGTH );
        }
      }
      evenMajorTicksPath.setShape( evenMajorTicksShape );
      oddMajorTicksPath.setShape( oddMajorTicksShape );

      // lays out the minor ticks
      var minorTicksShape = new Shape();
      var minorTickSeparation = segmentLength / denominator;
      for ( var j = 0; j <= maxNumberOfUnits * denominator; j++ ) {

        // skips major tick lines
        if ( j % denominator !== 0 ) {
          minorTicksShape.moveTo( j * minorTickSeparation, -IntroConstants.MINOR_TICK_LENGTH ).verticalLineToRelative( 2 * IntroConstants.MINOR_TICK_LENGTH );
        }
      }
      minorTicksPath.setShape( minorTicksShape );
    } );
    this.mutate( options );
  }

  fractionsIntro.register( 'NumberLineNode', NumberLineNode );

  return inherit( Node, NumberLineNode );
} );