extends SceneTree

func _initialize() -> void:
	var stage = load("res://stage.gd").new()
	var position_ = Vector2(200, 100)
	var size_ = Vector2(120, 240)
	for flipped in [false, true]:
		var transform_: Transform2D = stage.sprite_transform(position_, size_, flipped)
		var left: Vector2 = transform_ * (-size_ / 2)
		var right: Vector2 = transform_ * (size_ / 2)
		assert(is_equal_approx(minf(left.x, right.x), 200), "Mirror must preserve DOM left edge")
		assert(is_equal_approx(maxf(left.x, right.x), 320), "Mirror must preserve DOM right edge")
		assert(is_equal_approx(left.y, 100) and is_equal_approx(right.y, 340))
		assert((left.x > right.x) == flipped, "Mirror must reverse orientation")
	stage.free()
	print("PASS: Godot mirror keeps actor bounds and reverses facing")
	quit()
