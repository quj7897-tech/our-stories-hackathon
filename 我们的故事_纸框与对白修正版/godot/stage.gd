extends Node2D
## Godot renders only chapters 1 and 2. The existing web timeline supplies
## exact poses/positions; DOM captions, thoughts, props and choices stay intact.
var textures: Dictionary = {}
var state: Dictionary = {}
var receive_callback: JavaScriptObject
var last_generation := -1

func _ready() -> void:
	# Keep the original animated DOM environment below this actor layer.
	get_viewport().transparent_bg = true
	for kind in ["boy", "girl"]:
		for frame in range(16):
			textures[kind + "_" + str(frame)] = load("res://assets/frames/%s_%02d.png" % [kind, frame])
	if OS.has_feature("web"):
		receive_callback = JavaScriptBridge.create_callback(_receive)
		JavaScriptBridge.get_interface("window").loveGodotSetState = receive_callback
		JavaScriptBridge.eval("parent.postMessage({type:'love-godot-ready'},location.origin)")

func _receive(args: Array) -> void:
	if args.is_empty(): return
	var parsed: Variant = JSON.parse_string(str(args[0]))
	if not parsed is Dictionary: return
	if str(parsed.get("scene", "")) not in ["subway", "night"]: return
	state = parsed
	queue_redraw()

func _draw() -> void:
	if state.is_empty(): return
	var scene_id := str(state.get("scene", "subway"))
	var source_size := Vector2(float(state.get("width", 1280)), float(state.get("height", 720)))
	if source_size.x <= 0 or source_size.y <= 0: return
	var target_size := get_viewport_rect().size
	var ratio := target_size / source_size
	for actor: Dictionary in state.get("actors", []):
		var key := str(actor.get("kind", "girl")) + "_" + str(int(actor.get("frame", 0)))
		var sprite: Texture2D = textures.get(key)
		if sprite == null: continue
		var position_ := Vector2(float(actor.get("x", 0)), float(actor.get("y", 0))) * ratio
		var size_ := Vector2(float(actor.get("width", 0)), float(actor.get("height", 0))) * ratio
		draw_set_transform_matrix(sprite_transform(position_, size_, bool(actor.get("flip", false))))
		draw_texture_rect(sprite, Rect2(-size_ / 2, size_), false, Color(1, 1, 1, float(actor.get("opacity", 1))))
		draw_set_transform_matrix(Transform2D.IDENTITY)
	var generation := int(state.get("generation", 0))
	if last_generation != generation and OS.has_feature("web"):
		last_generation = generation
		RenderingServer.frame_post_draw.connect(_notify_painted.bind(scene_id, generation), CONNECT_ONE_SHOT)

func _notify_painted(scene_id: String, generation: int) -> void:
	JavaScriptBridge.eval("parent.postMessage({type:'love-godot-painted',scene:'%s',generation:%d},location.origin)" % [scene_id, generation])

func sprite_transform(position_: Vector2, size_: Vector2, flipped: bool) -> Transform2D:
	return Transform2D(Vector2(-1 if flipped else 1, 0), Vector2(0, 1), position_ + size_ / 2)
