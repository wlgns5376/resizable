/**
 * Resizable
 * @version 0.1.0
 * @author Ji Hoon Kang
 **/

(function($){

    function Resizer(element, options){
        this.element = $(element);
        this.settings = $.extend({}, Resizer.DEFAULTS, options || {});

        this.init();
    };


    $.extend(Resizer, {

        DEFAULTS : {
            container : null,
            activeEvent : 'click'
        },

        prototype : {

            init : function(){
                this.element.addClass('resizable')
                            .attr('unselectable', 'on');

                this.resizer = null;
                this.container = $( this.settings.container || this.element.offsetParent().get(0) );

                this.createResizer();

                this.element.on( this.settings.activeEvent, $.proxy(this.onActive, this));
                this.resizer.on( 'mousedown', '.resizer-handles', $.proxy(this.onResizeStart, this));
            },

            createResizer : function(){
                if( !this.resizer ){
                    this.resizer = $('<div class="resizer">');
                    // e w s n
                    this.resizer.html(
                             '<div class="resizer-handles handle-nw"></div>'
                           + '<div class="resizer-handles handle-n"></div>'
                           + '<div class="resizer-handles handle-ne"></div>'
                           + '<div class="resizer-handles handle-w"></div>'
                           + '<div class="resizer-handles handle-e"></div>'
                           + '<div class="resizer-handles handle-sw"></div>'
                           + '<div class="resizer-handles handle-s"></div>'
                           + '<div class="resizer-handles handle-se"></div>'
                        )
                        .hide()
                        .css({
                            position : 'absolute'
                        })
                        .appendTo( this.container );

                    this.resizer.find('.resizer-handles').css('cursor', function(){
                        return this.className.replace('resizer-handles handle-', '') + '-resize';
                    });
                }
            },

            getCoords : function( element, isOffset ){
                var pos = isOffset ? element.offset() : element.position(),
                    w = element.outerWidth(),
                    h = element.outerHeight();

                return {
                    y1 : pos.top,
                    x1 : pos.left,
                    y2 : pos.top + h,
                    x2 : pos.left + w,
                    width : w,
                    height : h
                };
            },

            getPosition : function( target, container ){
                var coord = this.getCoords( target ),
                    containerCoord = this.getCoords( container || this.container );

                return {
                    top : coord.y1,
                    left : coord.x1,
                    bottom : containerCoord.height - coord.y2,
                    right : containerCoord.width - coord.x2
                };
            },

            active : function(){
                var coord = this.getCoords( this.element );

                this.resizer.css({
                        top : coord.y1,
                        left : coord.x1,
                        width : coord.width,
                        height : coord.height
                    })
                    .show();
            },

            deactive : function(){
                this.resizer.hide();
            },

            onActive : function( event ){
                this.active();
            },

            onDeactive : function( event ){
                this.deactive();
            },

            onResizeStart : function( event ){
                event.stopPropagation();

                var sx = event.pageX,
                    sy = event.pageY,
                    directions = this.getDirections(event.currentTarget),
                    sPos = this.getPosition( this.resizer );

                sPos.width = sPos.height = 'auto';
                this.resizer.css( sPos );

                function onResizing( event ){
                    var dx = event.pageX - sx,
                        dy = event.pageY - sy,
                        pos = {};

                    console.log(dx, dy);

                    if( dx == 0 && dy == 0 ){
                        return false;
                    }

                    if( directions.n ){
                        pos.top = sPos.top + dy;
                    } else if( directions.s ){
                        pos.bottom = sPos.bottom - dy;
                    }
                    if( directions.w ){
                        pos.left = sPos.left + dx;
                    } else if( directions.e ){
                        pos.right = sPos.right - dx;
                    }

                    this.resizer.css( pos );
                }

                function onResizeEnd( event ){
                    $(document).off('mousemove mouseup');
                    this.update();
                }

                $(document).on('mousemove', $.proxy(onResizing, this))
                           .on('mouseup', $.proxy(onResizeEnd, this));
            },

            getDirections : function( handle ){
                var direction = handle.className.replace('resizer-handles handle-', '');

                function whereIs( charector ){
                    return direction.indexOf( charector ) > -1;
                }
                return {
                    n : whereIs('n'),
                    s : whereIs('s'),
                    w : whereIs('w'),
                    e : whereIs('e')
                };
            },

            update : function(){
                var coord = this.getCoords( this.element ),
                    w = this.resizer.outerWidth(),
                    h = this.resizer.outerHeight();

                this.resizer.css({
                    top : coord.y1,
                    left : coord.x1,
                    width : w,
                    height : h,
                    right : 'auto',
                    bottom : 'auto'
                });

                this.element.css({
                    width : w,
                    height : h
                });
            }
        }

    });

    $.fn.resizable = function( options ){

        var isMethodCall = typeof options === "string",
            args = Array.prototype.slice.call( arguments, 1 ),
            returnValue = this;


        this.each(function(){
            var instance = $.data(this, 'Resizer'),
                methodValue;

            if( !instance ){
                instance = $.data( this, 'Resizer', new Resizer(this, options) );
            }
            if( isMethodCall ){
                if ( !$.isFunction(instance[options]) || options.charAt(0) === "_" ) {
                    return $.error("no such method '" + options + "' for Resizer widget instance");
                }
                methodValue = instance[options].apply(instance, args);

                if ( methodValue !== instance && methodValue !== undefined ) {
                    returnValue = methodValue && methodValue.jquery
                                        ? returnValue.pushStack( methodValue.get() )
                                        : methodValue;
                    return false;
                }
            }
        });
        return returnValue;
    };

})(jQuery);