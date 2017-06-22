// Copyright 2017, University of Colorado Boulder

/**
 * TODO: doc
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var AlignBox = require( 'SCENERY/nodes/AlignBox' );
  var arrayRemove = require( 'PHET_CORE/arrayRemove' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var fractionsIntro = require( 'FRACTIONS_INTRO/fractionsIntro' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );

  /**
   * @constructor
   * @extends {Node}
   *
   * @param {IntroModel} model
   */
  function CellSceneView( model ) {

    var self = this;

    // @private
    this.model = model;

    // @private {Node}
    this.containerLayer = new HBox( {
      spacing: 10
    } );

    // @private {Node}
    this.pieceLayer = new Node();

    // @private {Array.<CircularContainerNode>}
    this.containerNodes = [];

    // @private {Array.<*>} TODO improve doc type
    this.pieceNodes = [];

    // @private {function}
    this.addListener = this.addContainer.bind( this );
    this.removeListener = this.removeContainer.bind( this );
    this.pieceAddedListener = this.onPieceAdded.bind( this );
    this.pieceRemovedListener = this.onPieceRemoved.bind( this );

    model.containers.addItemAddedListener( this.addListener );
    model.containers.addItemRemovedListener( this.removeListener );
    model.pieces.addItemAddedListener( this.pieceAddedListener );
    model.pieces.addItemRemovedListener( this.pieceRemovedListener );

    // Initial setup
    model.containers.forEach( this.addListener );

    // @private
    this.bucket = new Rectangle( {
      rectWidth: 300,
      rectHeight: 100,
      centerX: 0,
      centerY: 100,
      fill: 'rgb(200,200,200)',
      stroke: 'black',
      cursor: 'pointer'
    } );
    var bucketLabel = new Text( 'Definitely a bucket', {
      font: new PhetFont( 30 ),
      center: this.bucket.localBounds.center,
      pickable: false
    } );
    this.bucket.addChild( bucketLabel );
    this.bucket.addInputListener( {
      down: function( event ) {
        self.onBucketDragStart( event );
      }
    } );

    Node.call( this, {
      children: [
        this.bucket,
        new AlignBox( this.containerLayer, {
          alignBounds: Bounds2.point( 0, -150 )
        } ),
        this.pieceLayer
      ]
    } );
  }

  fractionsIntro.register( 'CellSceneView', CellSceneView );

  return inherit( Node, CellSceneView, {
    /**
     *
     * @param {number} dt - time step
     * @public
     */
    step: function( dt ) {
      var self = this;

      _.each( this.pieceNodes.slice(), function( pieceNode ) {
        pieceNode.step( dt );

        if ( pieceNode.isUserControlled ) {
          var closestCell = self.getClosestCell( pieceNode.getMidpoint() );
          if ( closestCell ) {
            pieceNode.orient( closestCell, dt );
          }
        }
      } );
    },

    /**
     * returns the closest cell
     * @param {Vector2} midpoint
     * @param {number} [threshold]
     * @returns {Cell}
     */
    getClosestCell: function( midpoint, threshold ) {
      var self = this;

      var closestCell = null;
      var closestDistance = (threshold === undefined) ? Number.POSITIVE_INFINITY : 100;
      this.model.containers.forEach( function( container ) {
        container.cells.forEach( function( cell ) {
          if ( !cell.isFilledProperty.value ) {
            var cellMidpoint = self.getCellMidpoint( cell );
            var distance = cellMidpoint.distance( midpoint );
            if ( distance < closestDistance ) {
              closestDistance = distance;
              closestCell = cell;
            }
          }
        } );
      } );
      return closestCell;
    },

    /**
     * returns the midpoint associated the the cell
     * @param {Cell} cell
     * @returns {Vector2}
     * @public
     */
    getCellMidpoint: function( cell ) {
      var containerNode = _.find( this.containerNodes, function( containerNode ) {
        return containerNode.container === cell.container;
      } );
      //TODO: proper coordinate transform
      var matrix = containerNode.getUniqueTrail().getMatrixTo( this.pieceLayer.getUniqueTrail() );
      return matrix.timesVector2( containerNode.getMidpointByIndex( cell.index ) );
    },

    /**
     *
     * @param {Piece} piece
     * @private
     */
    onPieceAdded: function( piece ) {
      var self = this;

      //TODO: support on all
      if ( this.createPieceNode ) {
        var pieceNode = this.createPieceNode( piece, function() {
          self.model.completePiece( piece );
        }, function() {
          var currentMidpoint = pieceNode.getMidpoint();

          var closestCell = self.getClosestCell( currentMidpoint, 100 );

          pieceNode.isUserControlled = false;
          pieceNode.originProperty.value = currentMidpoint;

          if ( closestCell ) {
            pieceNode.destinationProperty.value = self.getCellMidpoint( closestCell );
            self.model.targetPieceToCell( piece, closestCell );
          }
          else {
            pieceNode.destinationProperty.value = self.bucket.centerTop;
          }
        } );

        var originCell = piece.originCellProperty.value;
        if ( originCell ) {
          pieceNode.originProperty.value = this.getCellMidpoint( originCell );
        }
        else {
          pieceNode.originProperty.value = this.bucket.centerTop;
        }

        var destinationCell = piece.destinationCellProperty.value;
        if ( destinationCell ) {
          pieceNode.destinationProperty.value = this.getCellMidpoint( destinationCell );
        }
        else {
          pieceNode.destinationProperty.value = this.bucket.centerTop;
        }

        this.pieceNodes.push( pieceNode );
        this.pieceLayer.addChild( pieceNode );
      }
      else {
        this.model.completePiece( piece );
      }
    },

    /**
     *
     * @param {Piece} piece
     * @private
     */
    onPieceRemoved: function( piece ) {
      //TODO: support on all
      if ( this.createPieceNode ) {
        var pieceNode = _.find( this.pieceNodes, function( pieceNode ) {
          return pieceNode.piece === piece;
        } );
        arrayRemove( this.pieceNodes, pieceNode );
        this.pieceLayer.removeChild( pieceNode );
      }
    },

    /**
     *
     * @param event
     */
    onBucketDragStart: function( event ) {
      var piece = this.model.grabFromBucket();
      var pieceNode = _.find( this.pieceNodes, function( pieceNode ) {
        return pieceNode.piece === piece;
      } );

      pieceNode.originProperty.value = this.globalToLocalPoint( event.pointer.point );
      pieceNode.isUserControlled = true;
      pieceNode.dragListener.startDrag( event );
    },

    /**
     *
     * @param {Cell} cell
     * @param event
     */
    onExistingCellDragStart: function( cell, event ) {
      var piece = this.model.grabCell( cell );
      var pieceNode = _.find( this.pieceNodes, function( pieceNode ) {
        return pieceNode.piece === piece;
      } );

      pieceNode.originProperty.value = this.getCellMidpoint( cell );
      pieceNode.isUserControlled = true;
      pieceNode.dragListener.startDrag( event );
    },

    /**
     * This function should be overridden by the parent method
     * @param {Container} container
     * @param {Function} cellDownCallback
     * @private
     */
    createContainerNode: function( container, cellDownCallback ) {
      throw new Error( 'abstract method' );
    },

    /**
     * add a container node to the scene graph
     * @param {Container} container
     * @private
     */
    addContainer: function( container ) {
      var containerNode = this.createContainerNode( container, this.onExistingCellDragStart.bind( this ) );

      this.containerNodes.push( containerNode );
      this.containerLayer.addChild( containerNode );
    },

    /**
     * remove a container node from the scene graph
     * @param {Container} container
     * @private
     */
    removeContainer: function( container ) {
      var containerNode = _.find( this.containerNodes, function( containerNode ) {
        return containerNode.container === container;
      } );

      this.containerLayer.removeChild( containerNode );
      arrayRemove( this.containerNodes, containerNode );

      containerNode.dispose();
    },

    /**
     * @public
     */
    dispose: function() {
      _.each( this.containerNodes, function( containerNode ) {
        containerNode.dispose();
      } );

      this.model.containers.removeItemAddedListener( this.addListener );
      this.model.containers.removeItemRemovedListener( this.removeListener );
      this.model.pieces.removeItemAddedListener( this.pieceAddedListener );
      this.model.pieces.removeItemRemovedListener( this.pieceRemovedListener );

      Node.prototype.dispose.call( this );
    }
  } );
} );
