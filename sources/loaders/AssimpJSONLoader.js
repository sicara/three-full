//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WARNING: This file was auto-generated, any change will be overridden in next release. Please use configs/es6.conf.js then run "npm run convert". //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import { FileLoader } from './FileLoader.js'
import { BufferGeometry } from '../core/BufferGeometry.js'
import { Float32BufferAttribute } from '../core/BufferAttribute.js'
import { MeshPhongMaterial } from '../materials/MeshPhongMaterial.js'
import { Object3D } from '../core/Object3D.js'
import { Matrix4 } from '../math/Matrix4.js'
import { Mesh } from '../objects/Mesh.js'
import { TextureLoader } from './TextureLoader.js'
import { RepeatWrapping } from '../constants.js'
import { DefaultLoadingManager } from './LoadingManager.js'
import { LoaderUtils } from './LoaderUtils.js'
import { Loader } from './Loader.js'

var AssimpJSONLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

};

AssimpJSONLoader.prototype = {

	constructor: AssimpJSONLoader,

	crossOrigin: 'anonymous',

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var path = LoaderUtils.extractUrlBase( url );

		var loader = new FileLoader( this.manager );
		loader.load( url, function ( text ) {

			var json = JSON.parse( text );
			var metadata = json.__metadata__;

			// check if __metadata__ meta header is present
			// this header is used to disambiguate between different JSON-based file formats

			if ( typeof metadata !== 'undefined' ) {

				// check if assimp2json at all

				if ( metadata.format !== 'assimp2json' ) {

					onError( 'AssimpJSONLoader: Not an assimp2json scene.' );
					return;

				// check major format version

				} else if ( metadata.version < 100 && metadata.version >= 200 ) {

					onError( 'AssimpJSONLoader: Unsupported assimp2json file format version.' );
					return;

				}

			}

			onLoad( scope.parse( json, path ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;
		return this;

	},

	parse: function ( json, path ) {

		function parseList( json, handler ) {

			var meshes = new Array( json.length );

			for ( var i = 0; i < json.length; ++ i ) {

				meshes[ i ] = handler.call( this, json[ i ] );

			}

			return meshes;

		}

		function parseMesh( json ) {

			var geometry = new BufferGeometry();

			var i, l, face;

			var indices = [];

			var vertices = json.vertices || [];
			var normals = json.normals || [];
			var uvs = json.texturecoords || [];
			var colors = json.colors || [];

			uvs = uvs[ 0 ] || []; // only support for a single set of uvs

			for ( i = 0, l = json.faces.length; i < l; i ++ ) {

				face = json.faces[ i ];
				indices.push( face[ 0 ], face[ 1 ], face[ 2 ] );

			}

			geometry.setIndex( indices );
			geometry.addAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );

			if ( normals.length > 0 ) {

				geometry.addAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );

			}

			if ( uvs.length > 0 ) {

				geometry.addAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

			}

			if ( colors.length > 0 ) {

				geometry.addAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

			}

			geometry.computeBoundingSphere();

			return geometry;

		}

		function parseMaterial( json ) {

			var material = new MeshPhongMaterial();

			for ( var i in json.properties ) {

				var property = json.properties[ i ];
				var key = property.key;
				var value = property.value;

				switch ( key ) {

					case '$tex.file': {

						var semantic = property.semantic;

						// prop.semantic gives the type of the texture
						// 1: diffuse
						// 2: specular mao
						// 5: height map (bumps)
						// 6: normal map
						// more values (i.e. emissive, environment) are known by assimp and may be relevant

						if ( semantic === 1 || semantic === 2 || semantic === 5 || semantic === 6 ) {

							var keyname;

							switch ( semantic ) {

								case 1:
									keyname = 'map';
									break;
								case 2:
									keyname = 'specularMap';
									break;
								case 5:
									keyname = 'bumpMap';
									break;
								case 6:
									keyname = 'normalMap';
									break;

							}

							var texture = textureLoader.load( value );

							// TODO: read texture settings from assimp.
							// Wrapping is the default, though.

							texture.wrapS = texture.wrapT = RepeatWrapping;

							material[ keyname ] = texture;

						}

						break;

					}

					case '?mat.name':
						material.name = value;
						break;

					case '$clr.diffuse':
						material.color.fromArray( value );
						break;

					case '$clr.specular':
						material.specular.fromArray( value );
						break;

					case '$clr.emissive':
						material.emissive.fromArray( value );
						break;

					case '$mat.shininess':
						material.shininess = value;
						break;

					case '$mat.shadingm':
						// aiShadingMode_Flat
						material.flatShading = ( value === 1 ) ? true : false;
						break;

					case '$mat.opacity':
						if ( value < 1 ) {

							material.opacity = value;
							material.transparent = true;

						}
						break;

				}

			}

			return material;

		}

		function parseObject( json, node, meshes, materials ) {

			var obj = new Object3D(),	i, idx;

			obj.name = node.name || '';
			obj.matrix = new Matrix4().fromArray( node.transformation ).transpose();
			obj.matrix.decompose( obj.position, obj.quaternion, obj.scale );

			for ( i = 0; node.meshes && i < node.meshes.length; i ++ ) {

				idx = node.meshes[ i ];
				obj.add( new Mesh( meshes[ idx ], materials[ json.meshes[ idx ].materialindex ] ) );

			}

			for ( i = 0; node.children && i < node.children.length; i ++ ) {

				obj.add( parseObject( json, node.children[ i ], meshes, materials ) );

			}

			return obj;

		}

		var textureLoader = new TextureLoader( this.manager );
		textureLoader.setPath( path ).setCrossOrigin( this.crossOrigin );

		var meshes = parseList( json.meshes, parseMesh );
		var materials = parseList( json.materials, parseMaterial );
		return parseObject( json, json.rootnode, meshes, materials );

	}

};

export { AssimpJSONLoader }
