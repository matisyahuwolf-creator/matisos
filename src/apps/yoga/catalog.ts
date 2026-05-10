export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export type CatalogEntry = {
  id: string
  name: string
  difficulty: Difficulty
  benefits: string
}

export const catalog: CatalogEntry[] = [
  // ─── Beginner ───────────────────────────────────────────────────────────
  { id: 'mountain', name: 'Mountain Pose', difficulty: 'Beginner', benefits: 'Improves posture and stability; foundation for standing positions.' },
  { id: 'standing-forward-fold', name: 'Standing Forward Fold', difficulty: 'Beginner', benefits: 'Stretches hamstrings, calves, and lower back.' },
  { id: 'half-forward-fold', name: 'Half Forward Fold', difficulty: 'Beginner', benefits: 'Lengthens the spine and stretches the hamstrings.' },
  { id: 'easy', name: 'Easy Seated Pose', difficulty: 'Beginner', benefits: 'Opens hips and promotes comfortable seated posture.' },
  { id: 'staff', name: 'Staff Pose', difficulty: 'Beginner', benefits: 'Strengthens core and improves seated alignment.' },
  { id: 'child', name: "Child's Pose", difficulty: 'Beginner', benefits: 'Stretches lower back, hips, and thighs; gentle recovery position.' },
  { id: 'corpse', name: 'Corpse Pose', difficulty: 'Beginner', benefits: 'Promotes full-body relaxation and reduces nervous-system activation.' },
  { id: 'cat', name: 'Cat Stretch', difficulty: 'Beginner', benefits: 'Mobilizes spine into flexion; activates abdominal muscles.' },
  { id: 'cow', name: 'Cow Stretch', difficulty: 'Beginner', benefits: 'Mobilizes spine into extension; opens the chest.' },
  { id: 'thread-needle', name: 'Thread the Needle', difficulty: 'Beginner', benefits: 'Stretches upper back, shoulders, and the rotator cuff area.' },
  { id: 'cobra', name: 'Cobra', difficulty: 'Beginner', benefits: 'Strengthens spinal extensors; opens chest and front of shoulders.' },
  { id: 'sphinx', name: 'Sphinx', difficulty: 'Beginner', benefits: 'Gentle back extension; strengthens lumbar spine and opens chest.' },
  { id: 'locust', name: 'Locust', difficulty: 'Beginner', benefits: 'Strengthens posterior chain — back, glutes, hamstrings.' },
  { id: 'bridge', name: 'Bridge', difficulty: 'Beginner', benefits: 'Strengthens glutes and hamstrings; opens chest and hip flexors.' },
  { id: 'reclining-bound-angle', name: 'Reclining Butterfly', difficulty: 'Beginner', benefits: 'Passively opens hips and stretches inner thighs.' },
  { id: 'bound-angle', name: 'Butterfly (Seated)', difficulty: 'Beginner', benefits: 'Stretches inner thighs and groin; opens hips.' },
  { id: 'happy-baby', name: 'Happy Baby', difficulty: 'Beginner', benefits: 'Stretches lower back and inner thighs; releases hip tension.' },
  { id: 'legs-up-wall', name: 'Legs Up the Wall', difficulty: 'Beginner', benefits: 'Reduces leg swelling and aids venous return after activity.' },
  { id: 'supine-twist', name: 'Reclined Spinal Twist', difficulty: 'Beginner', benefits: 'Stretches lower back, glutes, and obliques; mobilizes spine.' },
  { id: 'seated-forward-fold', name: 'Seated Forward Fold', difficulty: 'Beginner', benefits: 'Stretches hamstrings, calves, and the full posterior spine.' },
  { id: 'tree', name: 'Tree Pose', difficulty: 'Beginner', benefits: 'Improves single-leg balance; strengthens ankles and stabilizers.' },
  { id: 'warrior-1', name: 'Warrior I', difficulty: 'Beginner', benefits: 'Strengthens legs; stretches hip flexors and chest.' },
  { id: 'warrior-2', name: 'Warrior II', difficulty: 'Beginner', benefits: 'Strengthens legs, hips, and shoulders; builds endurance.' },
  { id: 'chair', name: 'Chair Pose', difficulty: 'Beginner', benefits: 'Strengthens quads, glutes, and core; builds lower-body endurance.' },
  { id: 'triangle', name: 'Triangle Pose', difficulty: 'Beginner', benefits: 'Stretches hamstrings, hips, and the side body.' },
  { id: 'downward-dog', name: 'Downward Dog', difficulty: 'Beginner', benefits: 'Stretches hamstrings, calves, and shoulders; full-body engagement.' },
  { id: 'plank', name: 'Plank', difficulty: 'Beginner', benefits: 'Strengthens core, shoulders, and arms; builds total-body tension.' },
  { id: 'garland', name: 'Deep Squat', difficulty: 'Beginner', benefits: 'Opens hips, ankles, and groin; improves squat mobility.' },
  { id: 'high-lunge', name: 'High Lunge', difficulty: 'Beginner', benefits: 'Stretches hip flexors; strengthens legs and glutes.' },
  { id: 'low-lunge', name: 'Low Lunge', difficulty: 'Beginner', benefits: 'Deep hip-flexor stretch; opens the groin.' },
  { id: 'goddess', name: 'Goddess Squat', difficulty: 'Beginner', benefits: 'Strengthens inner thighs and glutes; opens hips.' },

  // ─── Intermediate ───────────────────────────────────────────────────────
  { id: 'warrior-3', name: 'Warrior III', difficulty: 'Intermediate', benefits: 'Strengthens legs and core; challenges single-leg balance.' },
  { id: 'half-moon', name: 'Half Moon', difficulty: 'Intermediate', benefits: 'Strengthens legs and core; demands balance and hip stability.' },
  { id: 'pyramid', name: 'Pyramid Pose', difficulty: 'Intermediate', benefits: 'Deep hamstring stretch; challenges balance.' },
  { id: 'eagle', name: 'Eagle Pose', difficulty: 'Intermediate', benefits: 'Stretches shoulders and upper back; improves balance.' },
  { id: 'dancer', name: 'Dancer Pose', difficulty: 'Intermediate', benefits: 'Stretches chest and quads; challenges balance.' },
  { id: 'side-angle', name: 'Extended Side Angle', difficulty: 'Intermediate', benefits: 'Stretches side body and groin; strengthens legs.' },
  { id: 'half-lord-of-fishes', name: 'Seated Spinal Twist', difficulty: 'Intermediate', benefits: 'Mobilizes thoracic spine; stretches glutes and obliques.' },
  { id: 'revolved-triangle', name: 'Revolved Triangle', difficulty: 'Intermediate', benefits: 'Mobilizes thoracic spine; stretches hamstrings.' },
  { id: 'revolved-chair', name: 'Revolved Chair', difficulty: 'Intermediate', benefits: 'Stretches obliques and spine; strengthens legs.' },
  { id: 'head-to-knee', name: 'Head-to-Knee Stretch', difficulty: 'Intermediate', benefits: 'Stretches hamstrings, hips, and the lower back.' },
  { id: 'wide-angle-fold', name: 'Wide-Leg Forward Fold (Seated)', difficulty: 'Intermediate', benefits: 'Stretches inner thighs and hamstrings.' },
  { id: 'cow-face', name: 'Cow-Face Stretch', difficulty: 'Intermediate', benefits: 'Stretches shoulders, chest, and outer hips.' },
  { id: 'hero', name: 'Hero Pose', difficulty: 'Intermediate', benefits: 'Stretches quadriceps and ankles; mobilizes knees.' },
  { id: 'pigeon', name: 'Pigeon Stretch', difficulty: 'Intermediate', benefits: 'Deep hip and glute stretch; opens the hip rotators.' },
  { id: 'lizard', name: 'Lizard Lunge', difficulty: 'Intermediate', benefits: 'Deep hip-flexor and inner-thigh stretch.' },
  { id: 'frog', name: 'Frog Stretch', difficulty: 'Intermediate', benefits: 'Stretches inner thighs and opens the hips wide.' },
  { id: 'half-lotus', name: 'Half-Crossed-Leg Sit', difficulty: 'Intermediate', benefits: 'Opens hips and requires external rotation.' },
  { id: 'boat', name: 'Boat Pose', difficulty: 'Intermediate', benefits: 'Strengthens core and hip flexors.' },
  { id: 'upward-dog', name: 'Upward-Facing Dog', difficulty: 'Intermediate', benefits: 'Strengthens arms and back; opens the chest.' },
  { id: 'camel', name: 'Camel Pose', difficulty: 'Intermediate', benefits: 'Deep backbend; opens chest and hip flexors.' },
  { id: 'bow', name: 'Bow Pose', difficulty: 'Intermediate', benefits: 'Strengthens back; stretches chest, hips, and quads.' },
  { id: 'fish', name: 'Fish Pose', difficulty: 'Intermediate', benefits: 'Opens chest and throat; strengthens upper back.' },
  { id: 'dolphin', name: 'Dolphin', difficulty: 'Intermediate', benefits: 'Strengthens shoulders and core; prep work for inversions.' },
  { id: 'side-plank', name: 'Side Plank', difficulty: 'Intermediate', benefits: 'Strengthens obliques, shoulders, and arms.' },
  { id: 'crow', name: 'Crow Pose', difficulty: 'Intermediate', benefits: 'Strengthens arms, wrists, and core; entry to arm balancing.' },
  { id: 'plow', name: 'Plow Pose', difficulty: 'Intermediate', benefits: 'Stretches shoulders, spine, and hamstrings; gentle inversion.' },

  // ─── Advanced ───────────────────────────────────────────────────────────
  { id: 'lotus', name: 'Full Crossed-Leg Sit', difficulty: 'Advanced', benefits: 'Requires significant external rotation of the hips; opens the lower body.' },
  { id: 'wheel', name: 'Wheel / Backbend', difficulty: 'Advanced', benefits: 'Deep backbend; requires shoulder and hip flexibility plus strength.' },
  { id: 'shoulder-stand', name: 'Shoulder Stand', difficulty: 'Advanced', benefits: 'Full inversion; demands neck mobility and core control.' },
  { id: 'headstand', name: 'Headstand', difficulty: 'Advanced', benefits: 'Full inversion; demands core stability and shoulder strength.' },
  { id: 'forearm-stand', name: 'Forearm Stand', difficulty: 'Advanced', benefits: 'Advanced inversion; demands shoulder strength and balance.' },
  { id: 'handstand', name: 'Handstand', difficulty: 'Advanced', benefits: 'Full inversion; demands arm/shoulder strength and fine balance.' },
  { id: 'side-crow', name: 'Side Crow', difficulty: 'Advanced', benefits: 'Advanced arm balance; demands oblique strength and wrist tolerance.' },
  { id: 'eight-angle', name: 'Eight-Angle Pose', difficulty: 'Advanced', benefits: 'Advanced arm balance; demands core, hip flexibility, and arm strength.' },
  { id: 'firefly', name: 'Firefly Pose', difficulty: 'Advanced', benefits: 'Advanced arm balance; demands hamstring flexibility and arm strength.' },
]
