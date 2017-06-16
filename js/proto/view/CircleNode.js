// Copyright 2017, University of Colorado Boulder

/**
 * TODO: doc
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var fractionsIntro = require( 'FRACTIONS_INTRO/fractionsIntro' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var ProtoConstants = require( 'FRACTIONS_INTRO/proto/ProtoConstants' );
  var Shape = require( 'KITE/Shape' );

  /**
   * @constructor
   * @extends {Path}
   *
   * @param {number} denominator
   * @param {number} index
   */
  function CircleNode( denominator, index ) {
    assert && assert( index < denominator );

    var startAngle = index * 2 * Math.PI / denominator;
    var endAngle = ( index + 1 ) * 2 * Math.PI / denominator;
    var shape = new Shape();
    if ( denominator > 1 ) {
      shape.moveTo( 0, 0 );
    }
    shape.arc( 0, 0, ProtoConstants.CIRCULAR_RADIUS, startAngle, endAngle, false ).close();

    Path.call( this, shape, {
      fill: 'blue',
      stroke: 'black'
    } );
  }

  fractionsIntro.register( 'CircleNode', CircleNode );

  return inherit( Path, CircleNode );
} );
