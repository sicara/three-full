var Three = (function (exports) {
	'use strict';

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// WARNING: This file was auto-generated, any change will be overridden in next release. Please use configs/es6.conf.js then run "npm run convert". //
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	var NodeUtils = {

		elements: [ 'x', 'y', 'z', 'w' ],

		addShortcuts: function () {

			function applyShortcut( proxy, property, subProperty ) {

				if ( subProperty ) {

					return {

						get: function () {

							return this[ proxy ][ property ][ subProperty ];

						},

						set: function ( val ) {

							this[ proxy ][ property ][ subProperty ] = val;

						}

					};

				} else {

					return {

						get: function () {

							return this[ proxy ][ property ];

						},

						set: function ( val ) {

							this[ proxy ][ property ] = val;

						}

					};

				}

			}

			return function addShortcuts( proto, proxy, list ) {

				var shortcuts = {};

				for ( var i = 0; i < list.length; ++ i ) {

					var data = list[ i ].split( "." ),
						property = data[ 0 ],
						subProperty = data[ 1 ];

					shortcuts[ property ] = applyShortcut( proxy, property, subProperty );

				}

				Object.defineProperties( proto, shortcuts );

			};

		}()

	};

	exports.NodeUtils = NodeUtils;

	return exports;

}({}));
