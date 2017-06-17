// Copyright 2017, University of Colorado Boulder

/**
 * TODO: doc
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var fractionsIntro = require( 'FRACTIONS_INTRO/fractionsIntro' );
  var Range = require( 'DOT/Range' );

  return fractionsIntro.register( 'ProtoConstants', {
    // @public {Range} - Possible number of active containers
    MAX_RANGE: new Range( 1, 6 ),

    // @public {Range}
    DENOMINATOR_RANGE: new Range( 1, 8 ),

    // @public {Dimension2}
    RECTANGULAR_SIZE: new Dimension2( 50, 200 ),

    // @public {number}
    CIRCULAR_RADIUS: 60
  } );
} );